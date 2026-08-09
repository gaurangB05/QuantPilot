import { chromium, type Page, type Browser, type Locator } from "playwright-core";
import chromiumBinary from "@sparticuz/chromium";
import { authenticator } from "otplib";

const LOGIN_URL = "https://developers.kite.trade/login";
const CREATE_APP_URL = "https://developers.kite.trade/create";
const REDIRECT_URL = "https://tradeos-eta.vercel.app/api/auth/kite/callback";

// ─── Generic helpers ────────────────────────────────────────────────────────────

async function withDiagnostics<T>(page: Page, step: string, fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`[${step}] ${message} — stuck on page: ${page.url()}`);
  }
}

const ERROR_TEXT_SELECTOR =
  '.errorlist, .error, .alert, [class*="error"], [class*="Error"], [role="alert"]';

async function readPageError(page: Page): Promise<string | null> {
  const text = await page.locator(ERROR_TEXT_SELECTOR).first().textContent().catch(() => null);
  return text?.trim() || null;
}

// Zerodha's real login form gates further attempts behind an Altcha CAPTCHA widget
// (confirmed live: absent on a fresh page load, injected into the DOM the moment a
// submission doesn't cleanly succeed) that this automation has no way to solve.
// Detecting it lets a stuck submit fail fast with a clear reason instead of
// continuing to hammer buttons that are now guaranteed to keep failing.
async function captchaIsBlocking(page: Page): Promise<boolean> {
  return page
    .locator('altcha-widget, .captcha, [class*="captcha" i]')
    .first()
    .isVisible({ timeout: 500 })
    .catch(() => false);
}

// Tries several ways of submitting a form after filling its last field, checking
// `isDone` after each attempt. The exact markup of third-party pages is unknown to
// us, so no single mechanism (button selector, Enter key, etc) can be trusted alone
// — but each mechanism is a REAL submission, so they're tried one at a time with a
// generous wait in between, not fired in a tight burst. Confirmed live against
// kite.zerodha.com: submitting the same login/TOTP form twice in quick succession
// (which happens if a merely-slow-but-successful first response gets mistaken for
// failure) is itself what gets a session flagged and gated behind the CAPTCHA below
// — so patience here isn't cosmetic, it's what keeps a slow-but-fine attempt from
// turning into a genuinely broken one.
async function submitRobustly(page: Page, lastField: Locator, isDone: () => Promise<boolean>) {
  const bailIfCaptchaBlocked = async () => {
    if (await captchaIsBlocking(page)) {
      throw new Error(
        "Zerodha is asking to solve a CAPTCHA before continuing — this happens after a slow or duplicate login attempt, which this automated flow can't solve. Please try connecting again."
      );
    }
  };

  await lastField.press("Enter");
  if (await isDone()) return;
  await bailIfCaptchaBlocked();

  await page.evaluate(() => {
    const form = document.querySelector("form");
    if (form) (form as HTMLFormElement).requestSubmit();
  }).catch(() => {});
  if (await isDone()) return;
  await bailIfCaptchaBlocked();

  const buttonCandidates = [
    page.locator('button[type="submit"]'),
    page.locator('input[type="submit"]'),
    page.getByRole("button", { name: /login|sign in|continue|submit|verify|sign up|create/i }),
    page.getByText(/^(login|continue|submit|verify|sign up|create)$/i),
  ];
  for (const candidate of buttonCandidates) {
    const first = candidate.first();
    if (await first.isVisible({ timeout: 1500 }).catch(() => false)) {
      await first.click().catch(() => {});
      if (await isDone()) return;
      await bailIfCaptchaBlocked();
    }
  }

  throw new Error("Could not submit the form — no submission method worked.");
}

function randomString(length: number): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let out = "";
  for (let i = 0; i < length; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

function generateThrowawayCredentials() {
  return {
    email: `qp.${randomString(10)}@quantpilot-gen.com`,
    password: `Qp${randomString(8)}!9Xz`,
  };
}

async function extractTotpSecretFromPage(page: Page): Promise<string> {
  const bodyText = await page.locator("body").innerText();
  // Base32 alphabet (A-Z, 2-7) — TOTP secrets are distinctive enough that a length
  // match is reliable without needing to know the exact surrounding markup.
  const match = bodyText.match(/\b[A-Z2-7]{16,32}\b/);
  if (!match) throw new Error("Could not find a TOTP secret on the page.");
  return match[0];
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

// Blocks non-essential resources so pages render as fast as possible.
async function speedUpPage(page: Page) {
  await page.route("**/*", (route) => {
    const type = route.request().resourceType();
    if (["image", "stylesheet", "font", "media"].includes(type)) {
      return route.abort();
    }
    return route.continue();
  });
}

// Locates whatever TOTP input(s) are on the current step (single field or one-box-
// per-digit) and submits the given code, robust to either layout.
async function fillAndSubmitTotp(page: Page, code: string, excludeFields: Locator[] = []) {
  const anyInput = page.locator(
    'input:not([type="hidden"]):not([type="password"]):not([type="submit"]):not([type="button"])'
  );
  await anyInput.first().waitFor({ state: "visible", timeout: 15000 });

  const visibleInputs: Locator[] = [];
  const count = await anyInput.count();
  for (let i = 0; i < count; i++) {
    const el = anyInput.nth(i);
    let excluded = false;
    for (const ex of excludeFields) {
      const handle = await ex.elementHandle().catch(() => null);
      if (handle && (await el.evaluate((node, ref) => node === ref, handle).catch(() => false))) {
        excluded = true;
        break;
      }
    }
    if (excluded) continue;
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

  // 12s, not 6s: a TOTP code is single-use server-side, so declaring "not done" too
  // early and letting submitRobustly fire a second real submission risks resending
  // the SAME code — which Zerodha can reject as already-consumed even though it was
  // correct, indistinguishable from a wrong code from the outside.
  const totpGone = () =>
    page.waitForFunction(
      (n) => document.querySelectorAll('input:not([type="hidden"]):not([type="password"])').length < n,
      visibleInputs.length,
      { timeout: 12000 }
    ).then(() => true).catch(() => false);

  let lastField: Locator;
  if (visibleInputs.length === 1) {
    lastField = visibleInputs[0];
    await lastField.fill(code);
  } else {
    const digits = code.split("");
    const lastIdx = Math.min(digits.length, visibleInputs.length) - 1;
    for (let i = 0; i <= lastIdx; i++) await visibleInputs[i].fill(digits[i]);
    lastField = visibleInputs[lastIdx];
  }
  await submitRobustly(page, lastField, totpGone);
}

// ─── Step 1: create a throwaway developers.kite.trade account ─────────────────
// This console has its own separate login (NOT your Zerodha broker password) — we
// generate disposable credentials for it since it's just a container for the app.

function randomPhone(): string {
  let out = "9";
  for (let i = 0; i < 9; i++) out += Math.floor(Math.random() * 10);
  return out;
}

// Field IDs confirmed against the live signup form (developers.kite.trade/signup):
// id_email, id_name, id_password, id_confirm_password, id_phone, a required state
// <select> (no visible asterisk, but submission silently fails without it), and a
// required id_disclaimer checkbox.
async function signupDeveloperAccount(page: Page): Promise<void> {
  const creds = { ...generateThrowawayCredentials(), name: "QuantPilot User", phone: randomPhone() };

  await withDiagnostics(page, "goto login page", () => page.goto(LOGIN_URL, { waitUntil: "commit" }));
  await withDiagnostics(page, "open signup", async () => {
    const signupLink = page.getByRole("link", { name: /sign ?up/i }).first();
    await signupLink.click();
  });

  await withDiagnostics(page, "fill signup form", async () => {
    await page.locator("#id_email").fill(creds.email);
    await page.locator("#id_name").fill(creds.name);
    await page.locator("#id_password").fill(creds.password);
    await page.locator("#id_confirm_password").fill(creds.password);
    await page.locator("#id_phone").fill(creds.phone);

    const stateSelect = page.locator("select").first();
    if (await stateSelect.isVisible({ timeout: 3000 }).catch(() => false)) {
      const options = await stateSelect.locator("option").allTextContents();
      const karnataka = options.find((o) => o.trim().toUpperCase() === "KARNATAKA");
      if (karnataka) await stateSelect.selectOption({ label: karnataka });
    }

    const disclaimer = page.locator("#id_disclaimer");
    if (await disclaimer.isVisible({ timeout: 2000 }).catch(() => false)) {
      await disclaimer.check();
    }
  });

  const onAppsPage = () =>
    page.waitForURL((url) => url.pathname.includes("/apps") || url.pathname.includes("/create"), { timeout: 8000 })
      .then(() => true).catch(() => false);

  await withDiagnostics(page, "submit signup", async () => {
    try {
      await page.locator('input[type="submit"]').first().click();
      if (!(await onAppsPage())) {
        await submitRobustly(page, page.locator("#id_disclaimer"), onAppsPage);
      }
    } catch (err) {
      const pageError = await readPageError(page);
      if (pageError) throw new Error(`Zerodha says: "${pageError}"`);
      throw err;
    }
  });

  // TOTP setup only appears for some accounts/flows — handle it if shown, skip if not.
  const totpSecretVisible = await page
    .locator("body")
    .innerText()
    .then((t) => /\b[A-Z2-7]{16,32}\b/.test(t))
    .catch(() => false);
  if (totpSecretVisible) {
    await withDiagnostics(page, "setup totp", async () => {
      const secret = await extractTotpSecretFromPage(page);
      const code = authenticator.generate(secret);
      await fillAndSubmitTotp(page, code);
    });
  }
}

// ─── Step 2: create the Personal Kite Connect app ──────────────────────────────

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

// Extracts the value shown directly below a text label on the page (used for API
// key/secret, which render as plain text next to their label, not inside inputs).
async function extractLabeledValue(page: Page, label: string): Promise<string> {
  const text = await page.locator("body").innerText();
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const idx = lines.findIndex((l) => l === label);
  if (idx === -1 || idx + 1 >= lines.length) {
    throw new Error(`Could not find "${label}" on page (url: ${page.url()}).`);
  }
  return lines[idx + 1];
}

// Field IDs and page structure confirmed against the live create-app form:
// no Description field exists; App name is #id_name, client ID is #zerodha-id,
// redirect URL is #id_redirect_url. Submitting lands on the /apps list (not the
// new app's own page), so we find and follow the link matching our app name.
async function createPersonalKiteApp(
  page: Page,
  opts: { appName: string; zerodhaClientId: string }
): Promise<{ apiKey: string; apiSecret: string }> {
  await withDiagnostics(page, "goto create page", () =>
    page.goto(CREATE_APP_URL, { waitUntil: "domcontentloaded" })
  );

  await withDiagnostics(page, "select Personal type", () => clickAppTypeOption(page, "Personal"));
  await withDiagnostics(page, "fill app name", () => page.locator("#id_name").fill(opts.appName));
  await withDiagnostics(page, "fill client id", () =>
    page.locator("#zerodha-id").fill(opts.zerodhaClientId)
  );
  await withDiagnostics(page, "fill redirect url", () =>
    page.locator("#id_redirect_url").fill(REDIRECT_URL)
  );
  await withDiagnostics(page, "submit create form", () =>
    page.locator('input[type="submit"]').first().click()
  );
  await page.waitForURL((url) => url.pathname.includes("/apps"), { timeout: 15000 });

  await withDiagnostics(page, "open new app", async () => {
    const appLink = page.locator(`a[href^="/apps/"]`).filter({ hasText: opts.appName }).first();
    await appLink.click();
    await page.waitForURL((url) => /\/apps\/[^/]+$/.test(url.pathname), { timeout: 10000 });
  });

  const apiKey = await withDiagnostics(page, "read api key", () => extractLabeledValue(page, "API key"));

  await withDiagnostics(page, "reveal api secret", async () => {
    const showSecretEl = page.getByText("Show API secret", { exact: false }).first();
    await showSecretEl.click();
  });
  const apiSecret = await withDiagnostics(page, "read api secret", () =>
    extractLabeledValue(page, "API secret")
  );

  if (!apiKey.trim() || !apiSecret.trim()) {
    throw new Error(`Could not read API key/secret from the app details page (url: ${page.url()}).`);
  }
  return { apiKey: apiKey.trim(), apiSecret: apiSecret.trim() };
}

// ─── Orchestration ──────────────────────────────────────────────────────────────
// This creates the app only — it never sees the user's real Zerodha password or
// TOTP. Authorizing the app (the actual broker login) happens in the user's own
// browser via the real Kite Connect OAuth redirect: /api/auth/kite/login sends
// them to kite.zerodha.com directly, and /api/auth/kite/callback picks up the
// request_token Zerodha sends back. That's the only real-user authentication path.

export async function createKiteApp(opts: {
  zerodhaClientId: string;
  appName: string;
}): Promise<{ apiKey: string; apiSecret: string }> {
  const browser = await launchBrowser();
  try {
    const page = await newStealthPage(browser);
    await speedUpPage(page);

    await signupDeveloperAccount(page);
    return await createPersonalKiteApp(page, opts);
  } finally {
    await browser.close().catch(() => {});
  }
}
