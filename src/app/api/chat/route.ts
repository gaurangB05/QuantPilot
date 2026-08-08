import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateChatReply, type ChatMessage } from "@/lib/ai";
import { isInvestmentAdviceRequest, ADVICE_DISCLAIMER } from "@/lib/chat-guard";
import type {
  KitePortfolioData,
  KiteProfile,
  KiteMargins,
  KitePosition,
  KiteHolding,
  KiteOrder,
  KiteTrade,
} from "@/lib/kite";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await request.json().catch(() => null)) as
    | { message?: string; history?: ChatMessage[] }
    | null;
  const message = body?.message?.trim();
  if (!message) return NextResponse.json({ error: "Message required" }, { status: 400 });

  if (isInvestmentAdviceRequest(message)) {
    return NextResponse.json({ reply: ADVICE_DISCLAIMER });
  }

  const { data: tradingRow } = await supabase
    .from("user_trading_data")
    .select("profile, margins, positions, holdings, orders, trades")
    .eq("user_id", user.id)
    .single();

  if (!tradingRow) {
    return NextResponse.json({
      reply: "Connect your Zerodha account first so I can see your portfolio data.",
    });
  }

  const tradingData: KitePortfolioData = {
    profile: tradingRow.profile as KiteProfile,
    margins: tradingRow.margins as KiteMargins,
    positions: tradingRow.positions as { net: KitePosition[]; day: KitePosition[] },
    holdings: tradingRow.holdings as KiteHolding[],
    orders: tradingRow.orders as KiteOrder[],
    trades: tradingRow.trades as KiteTrade[],
  };

  const history = Array.isArray(body?.history) ? body.history.slice(-10) : [];

  try {
    const reply = await generateChatReply(tradingData, history, message);
    return NextResponse.json({ reply });
  } catch (err) {
    console.error("[chat]", err);
    const rateLimited = err instanceof Error && err.message === "RATE_LIMITED";
    return NextResponse.json({
      reply: rateLimited
        ? "I'm briefly rate-limited on the free AI tier — try again in a few seconds."
        : "Something went wrong answering that. Try again.",
    });
  }
}
