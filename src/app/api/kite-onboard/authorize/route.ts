import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { authorizeKiteApp } from "@/lib/kite-automation";
import { exchangeToken, fetchPortfolioData } from "@/lib/kite";

export const maxDuration = 60;

// Phase 2 of onboarding: uses the user's real Zerodha credentials (fresh, live
// TOTP code) to authorize the app created in phase 1 and fetch their data.
// Kept as its own fast request so the ~30s-lived TOTP code doesn't go stale.
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await request.json().catch(() => null)) as
    | { zerodhaClientId?: string; password?: string; totpCode?: string }
    | null;
  const zerodhaClientId = body?.zerodhaClientId?.trim().toUpperCase();
  const password = body?.password;
  const totpCode = body?.totpCode?.trim().replace(/\s+/g, "");

  if (!zerodhaClientId || !/^[A-Z]{2}[0-9A-Z]{4}$/.test(zerodhaClientId)) {
    return NextResponse.json({ error: "Invalid Zerodha Client ID." }, { status: 400 });
  }
  if (!password) return NextResponse.json({ error: "Password is required." }, { status: 400 });
  if (!totpCode || !/^\d{6}$/.test(totpCode)) {
    return NextResponse.json({ error: "Enter the current 6-digit code from your authenticator app." }, { status: 400 });
  }

  const { data: tokenRow } = await supabase
    .from("user_kite_tokens")
    .select("api_key, api_secret")
    .eq("user_id", user.id)
    .single();

  if (!tokenRow?.api_key || !tokenRow?.api_secret) {
    return NextResponse.json({ error: "No app found. Start the connection again." }, { status: 400 });
  }

  try {
    const { requestToken } = await authorizeKiteApp({
      apiKey: tokenRow.api_key,
      zerodhaClientId,
      password,
      totpCode,
    });

    const { access_token, kite_user_id, kite_user_name } = await exchangeToken(
      requestToken,
      tokenRow.api_key,
      tokenRow.api_secret
    );

    const { error: upsertErr } = await supabase
      .from("user_kite_tokens")
      .update({
        access_token,
        kite_user_id,
        kite_user_name,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id);
    if (upsertErr) throw new Error(upsertErr.message);

    try {
      const tradingData = await fetchPortfolioData(access_token, tokenRow.api_key);
      await supabase.from("user_trading_data").upsert(
        {
          user_id: user.id,
          profile: tradingData.profile,
          margins: tradingData.margins,
          positions: tradingData.positions,
          holdings: tradingData.holdings,
          orders: tradingData.orders,
          trades: tradingData.trades,
          fetched_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );
    } catch (fetchErr) {
      console.warn("[kite-onboard/authorize] trading data fetch failed (non-fatal):", fetchErr);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[kite-onboard/authorize]", err);
    const message = err instanceof Error ? err.message : "Something went wrong.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
