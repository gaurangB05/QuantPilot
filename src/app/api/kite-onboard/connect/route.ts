import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createKiteApp } from "@/lib/kite-automation";

export const maxDuration = 60;

// Vercel hard-kills the function at maxDuration and returns its own HTML timeout
// page — which never reaches our catch block, so the frontend gets `<!DOCTYPE...`
// instead of JSON. Racing against a shorter internal deadline means OUR code is
// always what responds, with a real JSON error, well before the platform can.
const SOFT_DEADLINE_MS = 50_000;

async function createKiteAppWithDeadline(
  opts: Parameters<typeof createKiteApp>[0]
): ReturnType<typeof createKiteApp> {
  let timeoutId: ReturnType<typeof setTimeout>;
  const deadline = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(
        new Error(
          "Setting up your Zerodha app is taking longer than expected. Please try again — it usually succeeds on retry."
        )
      );
    }, SOFT_DEADLINE_MS);
  });
  try {
    return await Promise.race([createKiteApp(opts), deadline]);
  } finally {
    clearTimeout(timeoutId!);
  }
}

// Onboarding automation: sets up a throwaway developer-console account and
// creates the Personal Kite Connect app for this user. Never touches the user's
// real Zerodha password/TOTP — those are entered directly on kite.zerodha.com
// right after this, via the browser redirect to /api/auth/kite/login.
// The whole body is inside one try/catch — including auth and body parsing, not
// just the automation call — so ANY unexpected exception here (a transient
// Supabase error, a cookie parse failure, anything) still returns JSON instead of
// escaping to Next.js's own unhandled-error HTML page, which a fetch() caller
// can't parse either.
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = (await request.json().catch(() => null)) as { zerodhaClientId?: string } | null;
    const zerodhaClientId = body?.zerodhaClientId?.trim().toUpperCase();
    if (!zerodhaClientId || !/^[A-Z]{2}[0-9A-Z]{4}$/.test(zerodhaClientId)) {
      return NextResponse.json({ error: "Invalid Zerodha Client ID." }, { status: 400 });
    }

    const { apiKey, apiSecret } = await createKiteAppWithDeadline({
      zerodhaClientId,
      appName: `QuantPilot-${user.id.slice(0, 8)}`,
    });

    // access_token/kite_user_id/kite_user_name get filled in by the callback once
    // the user completes the real Kite login redirect right after this.
    const { error } = await supabase.from("user_kite_tokens").upsert(
      {
        user_id: user.id,
        api_key: apiKey,
        api_secret: apiSecret,
        access_token: "",
        kite_user_id: "",
        kite_user_name: "",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );
    if (error) throw new Error(error.message);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[kite-onboard/connect]", err);
    const message = err instanceof Error ? err.message : "Something went wrong.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
