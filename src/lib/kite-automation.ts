import { chromium, type Page, type Browser, type Locator } from "playwright-core";
import chromiumBinary from "@sparticuz/chromium";

const LOGIN_URL = "https://developers.kite.trade/login";
const CREATE_APP_URL = "https://developers.kite.trade/create";
const REDIRECT_URL = "https://tradeos-eta.vercel.app/api/auth/kite/callback";

export interface ConnectResult {
  apiKey: string;
  apiSecret: string;
  requestToken: string;
}

async function withDiagnostics<T>(page: Page, step: string, fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`[${step}] ${message} — stuck on page: ${page.url()}`);
  }
}

async function findInputNearText(page: Page, text: string) {
  return page.locator(`xpath=//*[contains(normalize-space(text()), "${text}")]/following::input[1]`).first();
}

const ERROR_TEXT_SELECTOR =
  '.errorlist, .error, .alert, [class*="error"], [class*="Error"], [role="alert"]';

async function readPageError(page: Page): Promise<string | null> {
  const text = await page.locator(ERROR_TEXT_SELECTOR).first().textContent().catch(() => null);
  return text?.trim() || null;
}

// Tries several ways of submitting a form after filling its last field, checking
// `isDone` after each attempt. The exact markup of third-party pages is unknown to
// us, so no single mechanism (button selector, Enter key, etc) can be trusted alone.
async function submitRobustly(page: Page, lastField: Locator, isDone: () => Promise<boolean>) {
  await lastField.press("Enter");
  if (await isDone()) return;

  await page.keyboard.press("Enter");
  if (await isDone()) return;

  await page.evaluate(() => {
    const form = document.querySelector("form");
    if (form) (form as HTMLFormElement).requestSubmit();
  }).catch(() => {});
  if (await isDone()) return;

  const buttonCandidates = [
    page.locator('button[type="submit"]'),
    page.locator('input[type="submit"]'),
    page.getByRole("button", { name: /login|sign in|continue|submit|verify/i }),
    page.getByText(/^(login|continue|submit|verify)$/i),
  ];
  for (const candidate of buttonCandidates) {
    const first = candidate.first();
    if (await first.isVisible({ timeout: 1500 }).catch(() => false)) {
      await first.click().catch(() => {});
      if (await isDone()) return;
    }
  }

  throw new Error("Could not submit the form — no submission method worked.");
}

const REAL_USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

async function launchBrowser(): Promise<Browser> {
  const executablePath = await chromiumBinary.executablePath();
  return chromium.launch({
    args: [...chromiumBinary.args, "--disable-blink-features=AutomationControlled"],
    executablePath,
    headless: true,
  });
}

// Makes the headless session look like a normal desktop browser — sites like
// Zerodha can otherwise silently reject logins from an obviously-automated browser.
async function newStealthPage(browser: Browser): Promise<Page> {
  const context = await browser.newContext({
    userAgent: REAL_USER_AGENT,
    viewport: { width: 1366, height: 768 },
  });
  const page = await context.newPage();
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "webdriver", { get: () => undefined });
  });
  return page;
}

// Blocks non-essential resources so pages render (and the TOTP field appears)
// as fast as possible — the 6-digit code only has ~30s of validity to spend.
async function speedUpPage(page: Page) {
  await page.route("**/*", (route) => {
    const type = route.request().resourceType();
    if (["image", "stylesheet", "font", "media"].includes(type)) {
      return route.abort();
    }
    return route.continue();
  });
}

async function loginToZerodha(
  page: Page,
  opts: { zerodhaClientId: string; password: string; totpCode: string }
) {
  await withDiagnostics(page, "goto login page", () => page.goto(LOGIN_URL, { waitUntil: "commit" }));

  const clientIdEl = page.locator('input[type="text"]').first();
  await withDiagnostics(page, "fill client id", () => clientIdEl.fill(opts.zerodhaClientId));

  const passwordEl = page.locator('input[type="password"]').first();
  // Check both the password field AND the login button specifically — the password
  // field alone can vanish briefly during a failed-submit re-render, giving a false
  // "we moved on" signal.
  // Generous timeout — we'd rather wait for a slow-but-real response than fire a
  // second submission (stale CSRF token, duplicate POST) while the first is in flight.
  const passwordGone = () =>
    page.waitForFunction(
      () =>
        document.querySelectorAll('input[type="password"]').length === 0 &&
        !document.querySelector('input[type="submit"][value="Login"]'),
      null,
      { timeout: 6000 }
    ).then(() => true).catch(() => false);

  await withDiagnostics(page, "submit login", async () => {
    await passwordEl.fill(opts.password);
    try {
      await submitRobustly(page, passwordEl, passwordGone);
    } catch (err) {
      const pageError = await readPageError(page);
      if (pageError) throw new Error(`Zerodha says: "${pageError}"`);
      throw err;
    }
  });

  // Second factor — the caller passes the live 6-digit code from their authenticator
  // app; it must still be valid (within its ~30s window) by the time we reach here.
  // Deliberately excludes input[type="text"] — that risks matching a stale client-id
  // field if we're still (incorrectly) on the password step.
  await withDiagnostics(page, "fill totp", async () => {
    // Wait for at least one visible, fillable, non-password input to appear on this
    // new step. Excludes submit/button controls (never text-fillable) and, once we
    // know the client-id field's exact handle, that specific element too — both
    // caused crashes/corruption in earlier runs when we were still on the login step.
    const anyInput = page.locator(
      'input:not([type="hidden"]):not([type="password"]):not([type="submit"]):not([type="button"])'
    );
    await anyInput.first().waitFor({ state: "visible", timeout: 15000 });

    const visibleInputs = [];
    const count = await anyInput.count();
    for (let i = 0; i < count; i++) {
      const el = anyInput.nth(i);
      const isClientIdField = await el.evaluate((node, ref) => node === ref, await clientIdEl.elementHandle()).catch(() => false);
      if (isClientIdField) continue;
      if (await el.isVisible().catch(() => false)) visibleInputs.push(el);
    }
    if (visibleInputs.length === 0) {
      const pageError = await readPageError(page);
      if (pageError) throw new Error(`Zerodha says: "${pageError}"`);
      const dump = await page.locator("input").evaluateAll((els) =>
        els.map((e) => (e as HTMLElement).outerHTML).join("\n")
      ).catch(() => "(could not read inputs)");
      throw new Error(`Could not find the TOTP input field. All <input> elements on page:\n${dump}`);
    }

    const totpGone = () =>
      page.waitForFunction(
        (n) => document.querySelectorAll('input:not([type="hidden"]):not([type="password"])').length < n,
        visibleInputs.length,
        { timeout: 6000 }
      ).then(() => true).catch(() => false);

    let lastField: Locator;
    if (visibleInputs.length === 1) {
      // Single field takes the whole code.
      lastField = visibleInputs[0];
      await lastField.fill(opts.totpCode);
    } else {
      // Multiple boxes — one digit per box (common OTP UI pattern).
      const digits = opts.totpCode.split("");
      const lastIdx = Math.min(digits.length, visibleInputs.length) - 1;
      for (let i = 0; i <= lastIdx; i++) {
        await visibleInputs[i].fill(digits[i]);
      }
      lastField = visibleInputs[lastIdx];
    }
    await submitRobustly(page, lastField, totpGone);
  });
}

async function clickAppTypeOption(page: Page, label: string) {
  const candidates = [
    page.getByRole("radio", { name: new RegExp(label, "i") }),
    page.getByLabel(new RegExp(`^${label}$`, "i")),
    page.getByText(label, { exact: true }),
  ];
  for (const locator of candidates) {
    if (await locator.isVisible({ timeout: 3000 }).catch(() => false)) {
      await locator.click();
      return;
    }
  }
  throw new Error(`Could not find the "${label}" app type option`);
}

async function createPersonalKiteApp(
  page: Page,
  opts: { appName: string; zerodhaClientId: string; description: string }
): Promise<{ apiKey: string; apiSecret: string }> {
  await withDiagnostics(page, "goto create page", () =>
    page.goto(CREATE_APP_URL, { waitUntil: "domcontentloaded" })
  );

  await withDiagnostics(page, "select Personal type", () => clickAppTypeOption(page, "Personal"));
  await withDiagnostics(page, "fill app name", async () => {
    const el = await findInputNearText(page, "App name");
    await el.fill(opts.appName);
  });
  await withDiagnostics(page, "fill client id", () =>
    page.getByPlaceholder(/AB1234/i).fill(opts.zerodhaClientId)
  );
  await withDiagnostics(page, "fill redirect url", () =>
    page.getByPlaceholder("https://").first().fill(REDIRECT_URL)
  );
  await withDiagnostics(page, "fill description", async () => {
    const el = await findInputNearText(page, "Description");
    await el.fill(opts.description);
  });
  await withDiagnostics(page, "submit create form", () =>
    page.getByRole("button", { name: /^Create$/i }).click()
  );
  await page.waitForLoadState("networkidle").catch(() => {});

  const apiKey = await withDiagnostics(page, "read api key", () =>
    page.locator("input[readonly], input[disabled]").first().inputValue()
  );
  const showSecretBtn = page.getByRole("button", { name: /show api secret/i });
  if (await showSecretBtn.isVisible().catch(() => false)) await showSecretBtn.click();
  const apiSecret = await withDiagnostics(page, "read api secret", () =>
    page.locator("input[readonly], input[disabled]").nth(1).inputValue()
  );

  if (!apiKey.trim() || !apiSecret.trim()) {
    throw new Error(`Could not read API key/secret from the app details page (url: ${page.url()}).`);
  }
  return { apiKey: apiKey.trim(), apiSecret: apiSecret.trim() };
}

async function authorizeAndCaptureRequestToken(page: Page, apiKey: string): Promise<string> {
  const redirectPromise = page.waitForURL((url) => url.href.startsWith(REDIRECT_URL), { timeout: 30000 });
  await page.goto(`https://kite.zerodha.com/connect/login?v=3&api_key=${apiKey}`, {
    waitUntil: "domcontentloaded",
  });

  const authorizeBtn = page.getByRole("button", { name: /authorize/i });
  if (await authorizeBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
    await authorizeBtn.click();
  }

  await redirectPromise;
  const url = new URL(page.url());
  const requestToken = url.searchParams.get("request_token");
  const status = url.searchParams.get("status");
  if (status !== "success" || !requestToken) {
    throw new Error("Zerodha authorization did not complete successfully.");
  }
  return requestToken;
}

export async function connectZerodhaAccount(opts: {
  zerodhaClientId: string;
  password: string;
  totpCode: string;
  appName: string;
  description: string;
}): Promise<ConnectResult> {
  const browser = await launchBrowser();
  try {
    const page = await newStealthPage(browser);
    await speedUpPage(page);
    await loginToZerodha(page, opts);
    const { apiKey, apiSecret } = await createPersonalKiteApp(page, opts);
    const requestToken = await authorizeAndCaptureRequestToken(page, apiKey);
    return { apiKey, apiSecret, requestToken };
  } finally {
    await browser.close().catch(() => {});
  }
}
