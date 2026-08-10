"use client";

import { useState } from "react";
import type { KiteHolding, KiteMargins } from "@/lib/kite";

// Categorical palette, fixed order, validated for CVD separation + this app's
// #F8FAFC card surface (see conversation: node validate_palette.js). Slots with
// a contrast WARN (aqua/yellow/magenta) always ship with a direct label here,
// which satisfies the skill's relief requirement.
const CATEGORICAL = ["#2a78d6", "#eb6834", "#1baf7a", "#eda100", "#e87ba4", "#4a3aa7"];
const OTHER_COLOR = "#CBD5E1"; // neutral gray — "everything past the top 6"

const POSITIVE = "#16A34A"; // matches PnlCell/Badge elsewhere in the dashboard
const NEGATIVE = "#DC2626";

function fmtCompact(n: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n);
}

function ChartCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl p-5" style={{ background: "#F8FAFC", border: "1px solid #E5E7EB" }}>
      <h3 className="text-[13.5px] font-semibold text-[#111827]">{title}</h3>
      {subtitle && <p className="text-[11.5px] text-[#9CA3AF] mt-0.5 mb-4">{subtitle}</p>}
      {!subtitle && <div className="mb-4" />}
      {children}
    </div>
  );
}

// A single hover tooltip that follows whichever bar is active — one instance per
// chart, positioned via the row's own bounding box rather than the pointer, so it
// never drifts off a thin bar. Value leads (strong), label follows (secondary),
// per the skill's tooltip hierarchy.
function BarTooltip({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div
      className="absolute right-0 -top-8 z-10 px-2.5 py-1.5 rounded-lg text-[11.5px] whitespace-nowrap pointer-events-none"
      style={{ background: "#111827", color: "white" }}
    >
      <span className="inline-block w-2 h-2 rounded-full mr-1.5" style={{ background: color }} />
      <span className="font-semibold">{value}</span>
      <span className="text-[#9CA3AF] ml-1.5">{label}</span>
    </div>
  );
}

// ─── Chart 1: Holdings allocation (part-to-whole → categorical) ───────────────

export function HoldingsAllocationChart({ holdings }: { holdings: KiteHolding[] }) {
  const [hovered, setHovered] = useState<number | null>(null);

  const withValue = holdings
    .map((h) => ({ symbol: h.tradingsymbol, value: h.last_price * h.quantity }))
    .filter((h) => h.value > 0)
    .sort((a, b) => b.value - a.value);

  if (withValue.length === 0) {
    return (
      <ChartCard title="Holdings allocation" subtitle="Share of portfolio value by stock">
        <p className="text-[13px] text-[#9CA3AF] text-center py-6">No holdings to show yet.</p>
      </ChartCard>
    );
  }

  const top = withValue.slice(0, 6);
  const rest = withValue.slice(6);
  const otherValue = rest.reduce((sum, h) => sum + h.value, 0);
  const rows = otherValue > 0 ? [...top, { symbol: "Other", value: otherValue }] : top;
  const total = withValue.reduce((sum, h) => sum + h.value, 0);
  const max = Math.max(...rows.map((r) => r.value));

  return (
    <ChartCard title="Holdings allocation" subtitle="Share of portfolio value by stock">
      <div className="flex flex-col gap-2.5">
        {rows.map((row, i) => {
          const isOther = row.symbol === "Other";
          const color = isOther ? OTHER_COLOR : CATEGORICAL[i % CATEGORICAL.length];
          const pct = total > 0 ? (row.value / total) * 100 : 0;
          const widthPct = max > 0 ? (row.value / max) * 100 : 0;
          return (
            <div
              key={row.symbol}
              className="relative"
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => setHovered(i)}
              onBlur={() => setHovered(null)}
              tabIndex={0}
            >
              {hovered === i && (
                <BarTooltip label={`${pct.toFixed(1)}% of portfolio`} value={fmtCompact(row.value)} color={color} />
              )}
              <div className="flex items-center justify-between mb-1">
                <span className="text-[12px] font-medium text-[#374151]">{row.symbol}</span>
                <span className="text-[11.5px] text-[#9CA3AF]" style={{ fontVariantNumeric: "tabular-nums" }}>
                  {fmtCompact(row.value)}
                </span>
              </div>
              <div className="h-3 rounded-full overflow-hidden" style={{ background: "#EEF2F7" }}>
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${widthPct}%`,
                    background: color,
                    opacity: hovered === null || hovered === i ? 1 : 0.55,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </ChartCard>
  );
}

// ─── Chart 2: P&L by holding (above/below baseline → status color) ───────────

export function PnLBreakdownChart({ holdings }: { holdings: KiteHolding[] }) {
  const [hovered, setHovered] = useState<number | null>(null);

  const rows = holdings
    .filter((h) => h.pnl !== 0)
    .map((h) => ({ symbol: h.tradingsymbol, pnl: h.pnl }))
    .sort((a, b) => b.pnl - a.pnl)
    .slice(0, 8);

  if (rows.length === 0) {
    return (
      <ChartCard title="P&amp;L by holding" subtitle="Unrealised gain/loss, top movers">
        <p className="text-[13px] text-[#9CA3AF] text-center py-6">No P&amp;L to show yet.</p>
      </ChartCard>
    );
  }

  const max = Math.max(...rows.map((r) => Math.abs(r.pnl)), 1);

  return (
    <ChartCard title="P&amp;L by holding" subtitle="Unrealised gain/loss, top movers">
      <div className="flex flex-col gap-2">
        {rows.map((row, i) => {
          const isGain = row.pnl >= 0;
          const color = isGain ? POSITIVE : NEGATIVE;
          const widthPct = (Math.abs(row.pnl) / max) * 50; // each side of center gets half the track
          return (
            <div
              key={row.symbol}
              className="relative flex items-center gap-2"
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => setHovered(i)}
              onBlur={() => setHovered(null)}
              tabIndex={0}
            >
              {hovered === i && (
                <BarTooltip label={row.symbol} value={`${isGain ? "+" : ""}${fmtCompact(row.pnl)}`} color={color} />
              )}
              <span className="text-[11px] text-[#6B7280] w-16 shrink-0 text-right truncate">{row.symbol}</span>
              <div className="relative flex-1 h-4" style={{ background: "#F3F4F6", borderRadius: 4 }}>
                <div
                  className="absolute top-0 bottom-0 w-px"
                  style={{ left: "50%", background: "#D1D5DB" }}
                />
                <div
                  className="absolute top-0 bottom-0 rounded transition-all duration-300"
                  style={{
                    [isGain ? "left" : "right"]: "50%",
                    width: `${widthPct}%`,
                    background: color,
                    opacity: hovered === null || hovered === i ? 1 : 0.55,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex items-center gap-4 mt-3.5 pt-3.5" style={{ borderTop: "1px solid #E5E7EB" }}>
        <span className="flex items-center gap-1.5 text-[11px] text-[#6B7280]">
          <span className="w-2 h-2 rounded-full" style={{ background: POSITIVE }} /> Gain
        </span>
        <span className="flex items-center gap-1.5 text-[11px] text-[#6B7280]">
          <span className="w-2 h-2 rounded-full" style={{ background: NEGATIVE }} /> Loss
        </span>
      </div>
    </ChartCard>
  );
}

// ─── Chart 3: Margin utilization (single ratio against a limit → meter) ──────

export function MarginMeter({ equity }: { equity: KiteMargins["equity"] }) {
  const net = equity.net;
  const available = equity.available.live_balance;
  const usedPct = net > 0 ? Math.max(0, Math.min(100, ((net - available) / net) * 100)) : 0;
  const severity = usedPct >= 80 ? "#D03B3B" : usedPct >= 50 ? "#EDA100" : "#2563EB";

  return (
    <ChartCard title="Margin utilization" subtitle="Used vs. available, equity segment">
      <div className="flex items-baseline justify-between mb-2">
        <span className="text-[1.3rem] font-bold text-[#111827]" style={{ fontVariantNumeric: "tabular-nums" }}>
          {usedPct.toFixed(0)}%
        </span>
        <span className="text-[11.5px] text-[#9CA3AF]">used of net margin</span>
      </div>
      <div className="h-3 rounded-full overflow-hidden" style={{ background: "#DBEAFE" }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${usedPct}%`, background: severity }}
        />
      </div>
      <div className="flex items-center justify-between mt-2.5 text-[11.5px] text-[#9CA3AF]">
        <span>Available: {fmtCompact(available)}</span>
        <span>Net: {fmtCompact(net)}</span>
      </div>
    </ChartCard>
  );
}
