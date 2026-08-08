import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { exchangeToken, fetchPortfolioData } from "@/lib/kite";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const requestToken = searchParams.get("request_token");
  const status = searchParams.get("status");

  // Zerodha sends status=success on successful login
  if (status !== "success" || !requestToken) {
    return NextResponse.redirect(`${origin}/dashboard?error=kite_login_cancelled`);
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(`${origin}/request-access`);
  }

  // This is a re-authentication (daily session refresh) for an already-onboarded
  // user — their api_key/api_secret were set during the initial /api/kite-onboard
  // automation and must already exist.
  const { data: existing } = await supabase
    .from("user_kite_tokens")
    .select("api_key, api_secret")
    .eq("user_id", user.id)
    .single();

  if (!existing?.api_key || !existing?.api_secret) {
    return NextResponse.redirect(`${origin}/dashboard?error=kite_not_onboarded`);
  }

  try {
    const { access_token, kite_user_id, kite_user_name } = await exchangeToken(
      requestToken,
      existing.api_key,
      existing.api_secret
    );

    const { error } = await supabase
      .from("user_kite_tokens")
      .update({
        access_token,
        kite_user_id,
        kite_user_name,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id);

    if (error) throw new Error(error.message);

    // Fetch all trading data and persist — non-blocking; user can refresh if this fails
    try {
      const tradingData = await fetchPortfolioData(access_token, existing.api_key);
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
      console.warn("[Kite callback] trading data fetch failed (non-fatal):", fetchErr);
    }

    return NextResponse.redirect(`${origin}/dashboard`);
  } catch (err) {
    console.error("[Kite callback error]", err);
    return NextResponse.redirect(`${origin}/dashboard?error=kite_auth_failed`);
  }
}
