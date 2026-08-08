import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { connectZerodhaAccount } from "@/lib/kite-automation";
import { exchangeToken, fetchPortfolioData } from "@/lib/kite";

export const maxDuration = 60;

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

  try {
    const { apiKey, apiSecret, requestToken } = await connectZerodhaAccount({
      zerodhaClientId,
      password,
      totpCode,
      appName: `QuantPilot-${user.id.slice(0, 8)}`,
      description: "Personal trading dashboard powered by QuantPilot.",
    });

    const { access_token, kite_user_id, kite_user_name } = await exchangeToken(
      requestToken,
      apiKey,
      apiSecret
    );

    const { error: upsertErr } = await supabase.from("user_kite_tokens").upsert(
      {
        user_id: user.id,
        api_key: apiKey,
        api_secret: apiSecret,
        access_token,
        kite_user_id,
        kite_user_name,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );
    if (upsertErr) throw new Error(upsertErr.message);

    try {
      const tradingData = await fetchPortfolioData(access_token, apiKey);
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
      console.warn("[kite-onboard/connect] trading data fetch failed (non-fatal):", fetchErr);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[kite-onboard/connect]", err);
    const message = err instanceof Error ? err.message : "Something went wrong.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
