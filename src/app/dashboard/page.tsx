import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  fetchPortfolioData,
  type KitePortfolioData,
  type KiteProfile,
  type KiteMargins,
  type KitePosition,
  type KiteHolding,
  type KiteOrder,
  type KiteTrade,
} from "@/lib/kite";
import { generateDashboardConfig } from "@/lib/ai";
import Navbar from "@/components/Navbar";
import SubmitButton, { PendingOverlay } from "@/components/SubmitButton";
import ChatWidget from "@/components/ChatWidget";
import ConnectZerodhaModal from "@/components/ConnectZerodhaModal";
import { HoldingsAllocationChart, PnLBreakdownChart, MarginMeter } from "@/components/DashboardCharts";

// ─── Server actions ────────────────────────────────────────────────────────────

async function signOut() {
  "use server";
  const supabase = await createClient();
  // "local" scope only clears this session — "global" (the default) revokes
  // every session for the user, an extra round trip we don't need here.
  await supabase.auth.signOut({ scope: "local" });
  redirect("/login");
}

async function reconnectKite() {
  "use server";
  redirect("/api/auth/kite/login");
}

async function refreshData() {
  "use server";
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: tokenRow } = await supabase
    .from("user_kite_tokens")
    .select("access_token, api_key")
    .eq("user_id", user.id)
    .single();

  if (!tokenRow?.api_key) redirect("/dashboard");

  try {
    const tradingData = await fetchPortfolioData(tokenRow.access_token, tokenRow.api_key);
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
  } catch {
    redirect("/dashboard?error=kite_token_expired");
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

async function personalizeDashboard(formData: FormData) {
  "use server";
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const prompt = (formData.get("prompt") as string)?.trim();
  if (!prompt) redirect("/dashboard");

  const { data: tradingRow } = await supabase
    .from("user_trading_data")
    .select("profile, margins, positions, holdings, orders, trades")
    .eq("user_id", user.id)
    .single();

  if (!tradingRow) redirect("/dashboard");

  let widgets: string[];
  try {
    const config = await generateDashboardConfig(
      {
        profile: tradingRow.profile,
        margins: tradingRow.margins,
        positions: tradingRow.positions,
        holdings: tradingRow.holdings,
        orders: tradingRow.orders,
        trades: tradingRow.trades,
      },
      prompt
    );
    widgets = config.widgets;
  } catch (err) {
    console.error("[personalizeDashboard]", err);
    const rateLimited = err instanceof Error && err.message === "RATE_LIMITED";
    redirect(`/dashboard?error=${rateLimited ? "ai_rate_limited" : "ai_personalization_failed"}`);
  }

  redirect(`/dashboard?widgets=${encodeURIComponent(widgets.join(","))}`);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
}

function pct(n: number) {
  const sign = n >= 0 ? "+" : "";
  return `${sign}${n.toFixed(2)}%`;
}

function PnlCell({ value }: { value: number }) {
  const positive = value >= 0;
  return (
    <span className="font-semibold text-[13px]" style={{ color: positive ? "#16A34A" : "#DC2626" }}>
      {positive ? "+" : ""}{fmt(value)}
    </span>
  );
}

function Badge({ label, color }: { label: string; color: "blue" | "green" | "red" | "gray" | "yellow" }) {
  const map: Record<string, { bg: string; text: string }> = {
    blue:   { bg: "#EFF6FF", text: "#2563EB" },
    green:  { bg: "#DCFCE7", text: "#16A34A" },
    red:    { bg: "#FEF2F2", text: "#DC2626" },
    gray:   { bg: "#F3F4F6", text: "#6B7280" },
    yellow: { bg: "#FFFBEB", text: "#D97706" },
  };
  const c = map[color];
  return (
    <span className="px-2 py-0.5 rounded-md text-[11px] font-medium"
      style={{ background: c.bg, color: c.text }}>{label}</span>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2.5 px-5 py-10">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#F3F4F6" }}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <rect x="2" y="3" width="12" height="10" rx="1.5" stroke="#9CA3AF" strokeWidth="1.3" />
          <path d="M2 6.5h12" stroke="#9CA3AF" strokeWidth="1.3" />
        </svg>
      </div>
      <p className="text-[13px] text-[#9CA3AF] text-center">{text}</p>
    </div>
  );
}

function orderStatusColor(status: string): "blue" | "green" | "red" | "gray" | "yellow" {
  if (status === "COMPLETE") return "green";
  if (status === "CANCELLED" || status === "REJECTED") return "red";
  if (status === "OPEN" || status === "TRIGGER PENDING") return "yellow";
  return "gray";
}

// ─── Not-connected screen ─────────────────────────────────────────────────────

function NotConnected({ errorMsg }: { errorMsg?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="w-full max-w-md rounded-3xl p-10 text-center"
        style={{ background: "#F8FAFC", border: "1px solid #E5E7EB" }}>

        <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-5"
          style={{ background: "#2563EB" }}>
          <svg width="22" height="22" viewBox="0 0 16 16" fill="none">
            <path d="M3 12.5L8 3.5L13 12.5M5.5 9.5H10.5" stroke="white" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <h2 className="text-[1.4rem] font-bold text-[#111827] mb-2">Connect your Zerodha account</h2>
        <p className="text-[13.5px] text-[#6B7280] leading-relaxed mb-7">
          Link your Zerodha account to see your live portfolio, positions, holdings, orders, and margins — all in one place.
        </p>

        {errorMsg && (
          <div className="mb-5 px-4 py-3 rounded-xl text-[12.5px] text-left"
            style={{ background: "#FEF2F2", border: "1px solid #FECACA", color: "#DC2626" }}>
            {errorMsg}
          </div>
        )}

        <ConnectZerodhaModal />

        <p className="text-[11.5px] text-[#9CA3AF] mt-4">
          You&apos;ll be redirected to Zerodha to authorise access. We only read your data — we never trade on your behalf.
        </p>
      </div>
    </div>
  );
}

// ─── Token-expired screen ─────────────────────────────────────────────────────

function TokenExpired({ kiteUserName }: { kiteUserName?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="w-full max-w-md rounded-3xl p-10 text-center"
        style={{ background: "#FFFBEB", border: "1px solid #FDE68A" }}>

        <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-5"
          style={{ background: "#F59E0B" }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 3v7M10 14v1" stroke="white" strokeWidth="2" strokeLinecap="round" />
            <circle cx="10" cy="10" r="8.5" stroke="white" strokeWidth="1.5" />
          </svg>
        </div>

        <h2 className="text-[1.3rem] font-bold text-[#92400E] mb-2">Session expired</h2>
        <p className="text-[13.5px] text-[#92400E] leading-relaxed mb-6">
          {kiteUserName ? `Hi ${kiteUserName}, your` : "Your"} Zerodha session expires daily at 6 AM IST. Please reconnect to refresh your data.
        </p>

        <form action={reconnectKite}>
          <SubmitButton
            pendingText="Connecting…"
            className="w-full py-3 rounded-xl text-[14px] font-semibold text-white cursor-pointer"
            style={{ background: "linear-gradient(135deg, #D97706, #F59E0B)" }}>
            Reconnect Zerodha →
          </SubmitButton>
        </form>
      </div>
    </div>
  );
}

// ─── Portfolio view ───────────────────────────────────────────────────────────

function PortfolioView({ data, kiteUserName, kiteUserId, fetchedAt, widgets, errorMsg }: {
  data: KitePortfolioData;
  kiteUserName: string;
  kiteUserId: string;
  fetchedAt: string;
  widgets?: string;
  errorMsg?: string;
}) {
  const equity = data.margins.equity;
  const netPositions = data.positions.net.filter((p) => p.quantity !== 0);
  const totalPositionPnl = netPositions.reduce((sum, p) => sum + p.pnl, 0);
  const totalHoldingPnl = data.holdings.reduce((sum, h) => sum + h.pnl, 0);
  const holdingsValue = data.holdings.reduce((sum, h) => sum + h.last_price * h.quantity, 0);

  const stats = [
    { label: "Available Balance", value: fmt(equity.available.live_balance), sub: "Equity segment" },
    { label: "Net Margin", value: fmt(equity.net), sub: "After all debits" },
    { label: "Holdings Value", value: fmt(holdingsValue), sub: `${data.holdings.length} stocks`, pnl: totalHoldingPnl },
    { label: "Positions P&L", value: fmt(Math.abs(totalPositionPnl)), sub: `${netPositions.length} open`, pnl: totalPositionPnl },
  ];

  // Smart Risk Alert — warn when available margin buffer is thin, or absent entirely.
  const LOW_MARGIN_THRESHOLD_PCT = 20;
  const noFundsAlert = equity.net <= 0;
  const marginAvailablePct = equity.net > 0 ? (equity.available.live_balance / equity.net) * 100 : null;
  const lowMarginAlert = marginAvailablePct !== null && marginAvailablePct < LOW_MARGIN_THRESHOLD_PCT;

  const fetchedLabel = new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata",
  }).format(new Date(fetchedAt));

  // AI-personalized widget selection — which existing sections show, and in what order.
  // With no prompt submitted yet (widgets undefined), every section shows in its original order.
  const requested = widgets ? widgets.split(",").map((w) => w.trim().toLowerCase()).filter(Boolean) : null;
  const isVisible = (keywords: string[]) =>
    !requested || requested.some((w) => keywords.some((k) => w.includes(k)));
  const orderIndex = (keywords: string[]) => {
    if (!requested) return 0;
    const idx = requested.findIndex((w) => keywords.some((k) => w.includes(k)));
    return idx === -1 ? requested.length : idx;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

      {errorMsg && (
        <div className="mb-5 px-4 py-3 rounded-xl text-[12.5px]"
          style={{ background: "#FEF2F2", border: "1px solid #FECACA", color: "#DC2626" }}>
          {errorMsg}
        </div>
      )}

      {noFundsAlert ? (
        <div className="mb-5 px-4 py-3 rounded-xl text-[12.5px]"
          style={{ background: "#FFFBEB", border: "1px solid #FDE68A", color: "#92400E" }}>
          <strong>No funds available</strong> — your net margin is {fmt(equity.net)}. Add funds to your Zerodha account to start trading.
        </div>
      ) : lowMarginAlert && (
        <div className="mb-5 px-4 py-3 rounded-xl text-[12.5px]"
          style={{ background: "#FFFBEB", border: "1px solid #FDE68A", color: "#92400E" }}>
          <strong>Low margin buffer</strong> — only {marginAvailablePct!.toFixed(1)}% of your net margin is available
          ({fmt(equity.available.live_balance)} of {fmt(equity.net)}). Consider reducing exposure or adding funds.
        </div>
      )}

      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[1.5rem] font-bold text-[#111827] tracking-tight">Dashboard</h1>
          <p className="text-[13px] text-[#9CA3AF] mt-0.5">
            {kiteUserName} &middot; {kiteUserId} &middot; Zerodha &middot; Last updated {fetchedLabel}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <form action={personalizeDashboard} className="flex items-center gap-2 flex-1 sm:flex-none min-w-0">
            <input
              type="text"
              name="prompt"
              placeholder="Personalize your dashboard…"
              className="px-3 py-2 rounded-xl text-[12.5px] text-[#111827] w-full sm:w-56 min-w-0"
              style={{ border: "1px solid #E5E7EB", background: "white" }}
            />
            <SubmitButton
              pendingText="Personalizing…"
              className="px-4 py-2 rounded-xl text-[12.5px] font-medium text-white cursor-pointer whitespace-nowrap"
              style={{ background: "#2563EB" }}>
              Personalize
            </SubmitButton>
          </form>
          <form action={refreshData}>
            <SubmitButton
              pendingText="Refreshing…"
              className="px-4 py-2 rounded-xl text-[12.5px] font-medium text-[#6B7280] cursor-pointer whitespace-nowrap"
              style={{ border: "1px solid #E5E7EB", background: "white" }}>
              Refresh data
            </SubmitButton>
          </form>
          <form action={signOut}>
            <SubmitButton
              pendingText="Signing out…"
              className="px-4 py-2 rounded-xl text-[12.5px] font-medium text-[#DC2626] cursor-pointer whitespace-nowrap"
              style={{ border: "1px solid #FECACA", background: "#FEF2F2" }}>
              Sign out
            </SubmitButton>
            <PendingOverlay text="Signing out…" />
          </form>
        </div>
      </div>

      {(() => {
        const sections = [
          {
            key: "overview",
            keywords: ["portfolio", "pnl", "overview", "balance", "margin", "summary"],
            node: (
              <div key="overview" className="flex flex-col gap-4 mb-8">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {stats.map((s) => (
                    <div key={s.label}
                      className="p-5 rounded-2xl transition-all duration-200 hover:shadow-[0_4px_20px_rgba(17,24,39,0.06)] hover:-translate-y-0.5"
                      style={{ background: "#F8FAFC", border: "1px solid #E5E7EB" }}>
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-[#9CA3AF] mb-2">{s.label}</p>
                      <p className="text-[1.6rem] font-bold text-[#111827] leading-none tracking-tight">{s.value}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <p className="text-[11.5px] text-[#9CA3AF]">{s.sub}</p>
                        {s.pnl !== undefined && (
                          <span className="text-[11px] font-semibold" style={{ color: s.pnl >= 0 ? "#16A34A" : "#DC2626" }}>
                            {s.pnl >= 0 ? "+" : ""}{fmt(s.pnl)}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <HoldingsAllocationChart holdings={data.holdings} />
                  <PnLBreakdownChart holdings={data.holdings} />
                  <MarginMeter equity={equity} />
                </div>
              </div>
            ),
          },
          {
            key: "positions",
            keywords: ["position"],
            node: (
              <div key="positions" className="mb-6 rounded-2xl overflow-hidden" style={{ border: "1px solid #E5E7EB" }}>
                <div className="px-5 py-4 flex items-center justify-between"
                  style={{ background: "#F8FAFC", borderBottom: "1px solid #E5E7EB" }}>
                  <h2 className="text-[14px] font-semibold text-[#111827]">Open Positions</h2>
                  <span className="text-[12px] text-[#9CA3AF]">{netPositions.length} positions</span>
                </div>

                {netPositions.length === 0 ? (
                  <EmptyState text="No open positions today." />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-[13px]">
                      <thead>
                        <tr style={{ borderBottom: "1px solid #F3F4F6" }}>
                          {["Symbol", "Product", "Qty", "Avg Price", "LTP", "P&L"].map((h) => (
                            <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-[#9CA3AF]">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {netPositions.map((p, i) => (
                          <tr key={`${p.tradingsymbol}-${i}`}
                            className={`${i % 2 === 0 ? "bg-white" : "bg-[#FAFBFF]"} hover:bg-[#F1F5F9] transition-colors duration-150`}
                            style={{ borderBottom: "1px solid #F9FAFB" }}>
                            <td className="px-5 py-3.5 font-semibold text-[#111827]">{p.tradingsymbol}</td>
                            <td className="px-5 py-3.5"><Badge label={p.product} color="blue" /></td>
                            <td className="px-5 py-3.5 text-[#374151]">
                              <span style={{ color: p.quantity > 0 ? "#16A34A" : "#DC2626" }}>{p.quantity > 0 ? "+" : ""}{p.quantity}</span>
                            </td>
                            <td className="px-5 py-3.5 text-[#374151]">{fmt(p.average_price)}</td>
                            <td className="px-5 py-3.5 text-[#374151]">{fmt(p.last_price)}</td>
                            <td className="px-5 py-3.5"><PnlCell value={p.pnl} /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ),
          },
          {
            key: "holdings",
            keywords: ["holding"],
            node: (
              <div key="holdings" className="mb-6 rounded-2xl overflow-hidden" style={{ border: "1px solid #E5E7EB" }}>
                <div className="px-5 py-4 flex items-center justify-between"
                  style={{ background: "#F8FAFC", borderBottom: "1px solid #E5E7EB" }}>
                  <h2 className="text-[14px] font-semibold text-[#111827]">Holdings</h2>
                  <span className="text-[12px] text-[#9CA3AF]">{data.holdings.length} stocks</span>
                </div>

                {data.holdings.length === 0 ? (
                  <EmptyState text="No holdings in your demat account." />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-[13px]">
                      <thead>
                        <tr style={{ borderBottom: "1px solid #F3F4F6" }}>
                          {["Symbol", "Qty", "Avg Price", "LTP", "Day Change", "Total P&L"].map((h) => (
                            <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-[#9CA3AF]">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {data.holdings.map((h, i) => (
                          <tr key={h.tradingsymbol}
                            className={`${i % 2 === 0 ? "bg-white" : "bg-[#FAFBFF]"} hover:bg-[#F1F5F9] transition-colors duration-150`}
                            style={{ borderBottom: "1px solid #F9FAFB" }}>
                            <td className="px-5 py-3.5 font-semibold text-[#111827]">{h.tradingsymbol}</td>
                            <td className="px-5 py-3.5 text-[#374151]">{h.quantity}</td>
                            <td className="px-5 py-3.5 text-[#374151]">{fmt(h.average_price)}</td>
                            <td className="px-5 py-3.5 text-[#374151]">{fmt(h.last_price)}</td>
                            <td className="px-5 py-3.5">
                              <span className="text-[13px] font-medium" style={{ color: h.day_change >= 0 ? "#16A34A" : "#DC2626" }}>
                                {pct(h.day_change_percentage)}
                              </span>
                            </td>
                            <td className="px-5 py-3.5"><PnlCell value={h.pnl} /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ),
          },
          {
            key: "orders",
            keywords: ["order"],
            node: (
              <div key="orders" className="mb-6 rounded-2xl overflow-hidden" style={{ border: "1px solid #E5E7EB" }}>
                <div className="px-5 py-4 flex items-center justify-between"
                  style={{ background: "#F8FAFC", borderBottom: "1px solid #E5E7EB" }}>
                  <h2 className="text-[14px] font-semibold text-[#111827]">Orders</h2>
                  <span className="text-[12px] text-[#9CA3AF]">{data.orders.length} today</span>
                </div>

                {data.orders.length === 0 ? (
                  <EmptyState text="No orders placed today." />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-[13px]">
                      <thead>
                        <tr style={{ borderBottom: "1px solid #F3F4F6" }}>
                          {["Symbol", "Type", "Product", "Qty", "Price", "Status", "Time"].map((h) => (
                            <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-[#9CA3AF]">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {data.orders.map((o, i) => (
                          <tr key={o.order_id}
                            className={`${i % 2 === 0 ? "bg-white" : "bg-[#FAFBFF]"} hover:bg-[#F1F5F9] transition-colors duration-150`}
                            style={{ borderBottom: "1px solid #F9FAFB" }}>
                            <td className="px-5 py-3.5 font-semibold text-[#111827]">{o.tradingsymbol}</td>
                            <td className="px-5 py-3.5">
                              <Badge label={o.transaction_type} color={o.transaction_type === "BUY" ? "green" : "red"} />
                            </td>
                            <td className="px-5 py-3.5"><Badge label={o.product} color="blue" /></td>
                            <td className="px-5 py-3.5 text-[#374151]">{o.quantity}</td>
                            <td className="px-5 py-3.5 text-[#374151]">{o.average_price > 0 ? fmt(o.average_price) : fmt(o.price)}</td>
                            <td className="px-5 py-3.5"><Badge label={o.status} color={orderStatusColor(o.status)} /></td>
                            <td className="px-5 py-3.5 text-[#9CA3AF] text-[12px]">
                              {o.order_timestamp ? new Intl.DateTimeFormat("en-IN", { timeStyle: "short", timeZone: "Asia/Kolkata" }).format(new Date(o.order_timestamp)) : "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ),
          },
          {
            key: "trades",
            keywords: ["trade"],
            node: (
              <div key="trades" className="rounded-2xl overflow-hidden" style={{ border: "1px solid #E5E7EB" }}>
                <div className="px-5 py-4 flex items-center justify-between"
                  style={{ background: "#F8FAFC", borderBottom: "1px solid #E5E7EB" }}>
                  <h2 className="text-[14px] font-semibold text-[#111827]">Trades</h2>
                  <span className="text-[12px] text-[#9CA3AF]">{data.trades.length} executed today</span>
                </div>

                {data.trades.length === 0 ? (
                  <EmptyState text="No trades executed today." />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-[13px]">
                      <thead>
                        <tr style={{ borderBottom: "1px solid #F3F4F6" }}>
                          {["Symbol", "Type", "Product", "Qty", "Price", "Time"].map((h) => (
                            <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-[#9CA3AF]">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {data.trades.map((t, i) => (
                          <tr key={t.trade_id}
                            className={`${i % 2 === 0 ? "bg-white" : "bg-[#FAFBFF]"} hover:bg-[#F1F5F9] transition-colors duration-150`}
                            style={{ borderBottom: "1px solid #F9FAFB" }}>
                            <td className="px-5 py-3.5 font-semibold text-[#111827]">{t.tradingsymbol}</td>
                            <td className="px-5 py-3.5">
                              <Badge label={t.transaction_type} color={t.transaction_type === "BUY" ? "green" : "red"} />
                            </td>
                            <td className="px-5 py-3.5"><Badge label={t.product} color="blue" /></td>
                            <td className="px-5 py-3.5 text-[#374151]">{t.quantity}</td>
                            <td className="px-5 py-3.5 text-[#374151]">{fmt(t.average_price)}</td>
                            <td className="px-5 py-3.5 text-[#9CA3AF] text-[12px]">
                              {t.fill_timestamp ? new Intl.DateTimeFormat("en-IN", { timeStyle: "short", timeZone: "Asia/Kolkata" }).format(new Date(t.fill_timestamp)) : "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ),
          },
        ];

        let visible = sections.filter((s) => isVisible(s.keywords));
        if (visible.length === 0) visible = sections; // AI matched nothing usable — fall back to full dashboard
        if (requested) visible = [...visible].sort((a, b) => orderIndex(a.keywords) - orderIndex(b.keywords));

        return visible.map((s) => s.node);
      })()}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; widgets?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const params = await searchParams;
  const errorParam = params.error;

  const errorMessages: Record<string, string> = {
    kite_auth_failed: "Zerodha authentication failed. Please try again.",
    kite_login_cancelled: "Login was cancelled. Connect your account to continue.",
    kite_token_expired: "Your Zerodha session has expired. Please reconnect.",
    ai_personalization_failed: "Couldn't personalize your dashboard right now. Showing the default view.",
    ai_rate_limited: "Personalization is briefly rate-limited (free AI tier) — wait a few seconds and try again.",
    kite_not_onboarded: "Your Zerodha connection wasn't fully set up. Please connect again.",
  };
  const errorMsg = errorParam ? (errorMessages[errorParam] ?? "Something went wrong. Please try again.") : undefined;

  // Get stored Kite token for this user
  const { data: tokenRow } = await supabase
    .from("user_kite_tokens")
    .select("access_token, kite_user_id, kite_user_name")
    .eq("user_id", user.id)
    .single();

  if (!tokenRow) {
    return (
      <main className="min-h-screen bg-white">
        <Navbar showAuthLinks={false} />
        <NotConnected errorMsg={errorMsg} />
      </main>
    );
  }

  // Token expired signal from a failed refresh attempt
  if (errorParam === "kite_token_expired") {
    return (
      <main className="min-h-screen bg-white">
        <Navbar showAuthLinks={false} />
        <TokenExpired kiteUserName={tokenRow.kite_user_name} />
      </main>
    );
  }

  // Read trading data from Supabase (stored at login / last refresh)
  const { data: tradingRow } = await supabase
    .from("user_trading_data")
    .select("profile, margins, positions, holdings, orders, trades, fetched_at")
    .eq("user_id", user.id)
    .single();

  // No stored data yet — session expired or callback failed
  if (!tradingRow) {
    return (
      <main className="min-h-screen bg-white">
        <Navbar showAuthLinks={false} />
        <TokenExpired kiteUserName={tokenRow.kite_user_name} />
      </main>
    );
  }

  const portfolioData: KitePortfolioData = {
    profile:   tradingRow.profile   as KiteProfile,
    margins:   tradingRow.margins   as KiteMargins,
    positions: tradingRow.positions as { net: KitePosition[]; day: KitePosition[] },
    holdings:  tradingRow.holdings  as KiteHolding[],
    orders:    tradingRow.orders    as KiteOrder[],
    trades:    tradingRow.trades    as KiteTrade[],
  };

  return (
    <main className="min-h-screen bg-white">
      <Navbar showAuthLinks={false} />
      <PortfolioView
        data={portfolioData}
        kiteUserName={tokenRow.kite_user_name}
        kiteUserId={tokenRow.kite_user_id}
        fetchedAt={tradingRow.fetched_at as string}
        widgets={params.widgets}
        errorMsg={errorParam !== "kite_token_expired" ? errorMsg : undefined}
      />
      <ChatWidget />
    </main>
  );
}
