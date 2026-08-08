import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createKiteApp } from "@/lib/kite-automation";

export const maxDuration = 60;

// Phase 1 of onboarding: sets up a throwaway developer-console account and
// creates the Personal Kite Connect app. Doesn't touch the user's real Zerodha
// credentials at all — those are only needed in the fast, time-sensitive
// authorize phase (/api/kite-onboard/authorize), kept separate so a live TOTP
// code isn't stale by the time it's actually used.
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await request.json().catch(() => null)) as { zerodhaClientId?: string } | null;
  const zerodhaClientId = body?.zerodhaClientId?.trim().toUpperCase();
  if (!zerodhaClientId || !/^[A-Z]{2}[0-9A-Z]{4}$/.test(zerodhaClientId)) {
    return NextResponse.json({ error: "Invalid Zerodha Client ID." }, { status: 400 });
  }

  try {
    const { apiKey, apiSecret } = await createKiteApp({
      zerodhaClientId,
      appName: `QuantPilot-${user.id.slice(0, 8)}`,
    });

    // access_token/kite_user_id/kite_user_name get filled in by the authorize phase.
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
