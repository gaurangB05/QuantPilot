"use client";

import React from "react";
import { motion } from "framer-motion";
import { type DashboardId } from "./DynamicDashboard";

// ─── Shared ──────────────────────────────────────────────────────────────────

function KpiCard({ label, value, sub, color, delay = 0 }: { label: string; value: string; sub?: string; color: string; delay?: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
      className="rounded-2xl p-5 bg-white" style={{ border: "1px solid #E5E7EB" }}>
      <p className="text-[10.5px] font-semibold uppercase tracking-[0.07em] text-[#9CA3AF] mb-3">{label}</p>
      <p className="text-[24px] font-bold leading-none tracking-tight" style={{ color }}>{value}</p>
      {sub && <p className="text-[11.5px] text-[#6B7280] mt-2 leading-relaxed">{sub}</p>}
    </motion.div>
  );
}

function Panel({ title, children, delay = 0, className = "" }: { title?: string; children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
      className={`rounded-2xl p-5 bg-white ${className}`} style={{ border: "1px solid #E5E7EB" }}>
      {title && <p className="text-[10.5px] font-semibold uppercase tracking-[0.07em] text-[#9CA3AF] mb-4">{title}</p>}
      {children}
    </motion.div>
  );
}

// ─── FII / DII ────────────────────────────────────────────────────────────────

const FII_DAILY = [
  { d: "May 5",  fii: -1840, dii:  1420 },
  { d: "May 6",  fii:  2410, dii:   820 },
  { d: "May 7",  fii: -4230, dii:  3120 },
  { d: "May 8",  fii:  1540, dii:   490 },
  { d: "May 9",  fii:  3780, dii:  -620 },
  { d: "May 12", fii: -2240, dii:  1830 },
  { d: "May 13", fii:  1100, dii:  2240 },
  { d: "May 14", fii:  4510, dii:   930 },
  { d: "May 15", fii:  -820, dii:  1620 },
  { d: "May 16", fii:  3210, dii:  1240 },
  { d: "May 19", fii: -1510, dii:  2430 },
  { d: "May 20", fii:  1920, dii:   680 },
  { d: "May 21", fii:  2830, dii:  1120 },
  { d: "Jun 2",  fii: -1220, dii:  2030 },
];

function FIIFullScreen() {
  const MAX_V = 4600, ZERO_Y = 90, MAX_BAR = 75, LM = 46, CW = 680;
  const INNER = CW - LM - 8;
  const GW = INNER / FII_DAILY.length;
  const BW = Math.floor((GW - 6) / 2);

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "FII Net (60 Days)",  value: "+₹8,700 Cr",  sub: "Positive cumulative bias",        color: "#2563EB", delay: 0 },
          { label: "DII Net (60 Days)",  value: "+₹15,200 Cr", sub: "Strong domestic accumulation",    color: "#22C55E", delay: 0.06 },
          { label: "FII Net Today",      value: "-₹1,220 Cr",  sub: "Cash equity outflow",             color: "#EF4444", delay: 0.12 },
          { label: "Net Combined Flow",  value: "+₹810 Cr",    sub: "DII absorbing FII sell-off",      color: "#6B7280", delay: 0.18 },
        ].map((k) => <KpiCard key={k.label} {...k} />)}
      </div>

      <div className="grid lg:grid-cols-[1fr_360px] gap-4">
        <Panel title="Daily Net Flows — Last 14 Trading Sessions (₹ Crores)" delay={0.1}>
          <div className="flex items-center gap-5 mb-3">
            {[["#2563EB", "FII (positive = buying)"], ["#22C55E", "DII (positive = buying)"], ["#BFDBFE", "FII selling"], ["#BBF7D0", "DII selling"]].map(([c, l]) => (
              <div key={l} className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm shrink-0" style={{ background: c }} />
                <span className="text-[10.5px] text-[#6B7280]">{l}</span>
              </div>
            ))}
          </div>
          <svg viewBox={`0 0 ${CW} 195`} className="w-full" style={{ height: "210px" }}>
            {[-4000, -2000, 0, 2000, 4000].map((v) => {
              const y = ZERO_Y - (v / MAX_V) * MAX_BAR;
              return (
                <g key={v}>
                  <line x1={LM} y1={y} x2={CW - 8} y2={y} stroke={v === 0 ? "#9CA3AF" : "#F3F4F6"}
                    strokeWidth={v === 0 ? "1" : "0.5"} strokeDasharray={v !== 0 ? "3,3" : "0"} />
                  <text x={LM - 4} y={y + 3.5} textAnchor="end" fill="#9CA3AF" fontSize="8">
                    {v === 0 ? "₹0" : (v > 0 ? "+" : "") + (v / 1000) + "K"}
                  </text>
                </g>
              );
            })}
            {FII_DAILY.map((d, i) => {
              const gx = LM + i * GW;
              const fH = (Math.abs(d.fii) / MAX_V) * MAX_BAR;
              const dH = (Math.abs(d.dii) / MAX_V) * MAX_BAR;
              return (
                <g key={d.d}>
                  <rect x={gx + 2} width={BW} height={fH} y={d.fii >= 0 ? ZERO_Y - fH : ZERO_Y} rx="2"
                    fill={d.fii >= 0 ? "#2563EB" : "#BFDBFE"} fillOpacity="0.9" />
                  <rect x={gx + 2 + BW + 4} width={BW} height={dH} y={d.dii >= 0 ? ZERO_Y - dH : ZERO_Y} rx="2"
                    fill={d.dii >= 0 ? "#22C55E" : "#BBF7D0"} fillOpacity="0.9" />
                  <text x={gx + GW / 2} y={ZERO_Y + MAX_BAR + 20} textAnchor="middle" fill="#9CA3AF" fontSize="7.5">
                    {d.d.replace("May ", "").replace("Jun ", "J")}
                  </text>
                </g>
              );
            })}
          </svg>
        </Panel>

        <div className="flex flex-col gap-4">
          <Panel title="Today's Flow by Segment" delay={0.15}>
            <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #F3F4F6" }}>
              <div className="grid bg-[#F9FAFB] px-4 py-2 text-[9.5px] font-semibold uppercase tracking-wide text-[#9CA3AF]"
                style={{ gridTemplateColumns: "1.3fr 1fr 1fr 0.9fr" }}>
                {["Segment", "FII", "DII", "Net"].map((h) => <span key={h}>{h}</span>)}
              </div>
              {[
                { seg: "Cash Equity", fii: "-₹1,220 Cr", dii: "+₹2,030 Cr", net: "+₹810 Cr",   np: true },
                { seg: "F&O Index",   fii: "+₹3,180 Cr", dii: "+₹460 Cr",   net: "+₹3,640 Cr", np: true },
                { seg: "F&O Stock",   fii: "-₹920 Cr",   dii: "+₹540 Cr",   net: "-₹380 Cr",   np: false },
                { seg: "Debt",        fii: "+₹1,280 Cr", dii: "-₹240 Cr",   net: "+₹1,040 Cr", np: true },
              ].map((r) => (
                <div key={r.seg} className="grid px-4 py-3 border-t border-[#F3F4F6]"
                  style={{ gridTemplateColumns: "1.3fr 1fr 1fr 0.9fr" }}>
                  <span className="text-[12px] font-medium text-[#374151]">{r.seg}</span>
                  <span className="text-[11px]" style={{ color: r.fii.startsWith("+") ? "#16A34A" : "#DC2626" }}>{r.fii}</span>
                  <span className="text-[11px]" style={{ color: r.dii.startsWith("+") ? "#16A34A" : "#DC2626" }}>{r.dii}</span>
                  <span className="text-[11.5px] font-semibold" style={{ color: r.np ? "#16A34A" : "#DC2626" }}>{r.net}</span>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Market Sentiment" delay={0.2}>
            <div className="space-y-4">
              {[
                { label: "FII Conviction",  val: "Cautiously Positive", pct: 60, color: "#2563EB" },
                { label: "DII Stance",      val: "Consistent Buyer",    pct: 84, color: "#22C55E" },
                { label: "Overall Trend",   val: "Bullish Leaning",     pct: 70, color: "#6B7280" },
              ].map((m) => (
                <div key={m.label}>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-[12.5px] font-medium text-[#374151]">{m.label}</span>
                    <span className="text-[11.5px] font-semibold" style={{ color: m.color }}>{m.val}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-[#F3F4F6]">
                    <div className="h-full rounded-full" style={{ width: `${m.pct}%`, background: m.color }} />
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { t: "14-Day FII Average",   v: "+₹1,248 Cr/day",  d: "Positive buying bias sustained over 2 weeks",      c: "#2563EB", delay: 0.28 },
          { t: "DII Consistency",      v: "11 of 14 Sessions",d: "Domestic funds net buyers in most sessions",       c: "#22C55E", delay: 0.35 },
          { t: "FII vs DII Spread",    v: "DII Dominant",     d: "DII net flows 1.75× higher than FII over 60 days", c: "#6B7280", delay: 0.42 },
        ].map((c) => (
          <motion.div key={c.t} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: c.delay }}
            className="rounded-2xl p-5 bg-white" style={{ border: "1px solid #E5E7EB" }}>
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.07em] text-[#9CA3AF] mb-2">{c.t}</p>
            <p className="text-[18px] font-bold mb-1.5" style={{ color: c.c }}>{c.v}</p>
            <p className="text-[11.5px] text-[#6B7280] leading-relaxed">{c.d}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ─── Options Greeks ───────────────────────────────────────────────────────────

const FULL_POSITIONS = [
  { sym: "NIFTY",    strike: "23500 CE", type: "Long",  qty: "+5L", avg: "118", ltp: "142", pnl: "+₹12,000", delta: "+0.42", theta: "-8.2",  vega: "+4.1", iv: "14.2%" },
  { sym: "NIFTY",    strike: "23500 PE", type: "Short", qty: "-3L", avg: "82",  ltp: "68",  pnl: "+₹4,200",  delta: "+0.18", theta: "+6.1",  vega: "+2.8", iv: "13.8%" },
  { sym: "BNKNIFTY", strike: "52000 CE", type: "Short", qty: "-2L", avg: "248", ltp: "285", pnl: "-₹3,180",  delta: "-0.31", theta: "+12.4", vega: "+6.2", iv: "16.1%" },
  { sym: "NIFTY",    strike: "23200 CE", type: "Long",  qty: "+3L", avg: "186", ltp: "248", pnl: "+₹18,620", delta: "+0.58", theta: "-10.8", vega: "+5.4", iv: "12.8%" },
];

function GreeksFullScreen() {
  const COLS = "1.4fr 0.75fr 0.55fr 0.5fr 0.5fr 0.55fr 0.9fr 0.6fr 0.65fr 0.6fr";
  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Today's P&L",  value: "+₹31,640",  sub: "Across all 4 active positions",        color: "#22C55E", delay: 0 },
          { label: "Net Delta",    value: "+0.87",     sub: "Net long — bullish position book",       color: "#2563EB", delay: 0.06 },
          { label: "Theta Decay",  value: "-₹420/day", sub: "Daily time-value erosion cost",          color: "#EF4444", delay: 0.12 },
          { label: "Net Vega",     value: "+12.5",     sub: "IV exposure across all positions",       color: "#6B7280", delay: 0.18 },
        ].map((k) => <KpiCard key={k.label} {...k} />)}
      </div>

      <Panel title="Live Options Positions with Greeks" delay={0.1}>
        <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #F3F4F6" }}>
          <div className="grid bg-[#F9FAFB] px-4 py-2.5 text-[9.5px] font-semibold uppercase tracking-wide text-[#9CA3AF]"
            style={{ gridTemplateColumns: COLS }}>
            {["Symbol", "Strike", "Type", "Qty", "Avg", "LTP", "P&L Today", "Delta", "Theta", "IV"].map((h) => (
              <span key={h}>{h}</span>
            ))}
          </div>
          {FULL_POSITIONS.map((p, i) => {
            const pPos = p.pnl.startsWith("+");
            const tPos = p.theta.startsWith("+");
            return (
              <div key={i} className="grid px-4 py-3.5 border-t border-[#F3F4F6] items-center"
                style={{ gridTemplateColumns: COLS, background: i % 2 === 0 ? "#fff" : "#FAFAFA" }}>
                <span className="text-[13px] font-bold text-[#111827]">{p.sym}</span>
                <span className="text-[11.5px] text-[#374151]">{p.strike}</span>
                <span className="text-[10.5px] font-semibold px-2 py-0.5 rounded-md w-fit"
                  style={{ background: p.type === "Long" ? "#EFF6FF" : "#FEF2F2", color: p.type === "Long" ? "#1D4ED8" : "#DC2626" }}>
                  {p.type}
                </span>
                <span className="text-[12px]" style={{ color: p.qty.startsWith("+") ? "#2563EB" : "#6B7280" }}>{p.qty}</span>
                <span className="text-[12px] text-[#374151]">{p.avg}</span>
                <span className="text-[12.5px] font-semibold text-[#111827]">{p.ltp}</span>
                <span className="text-[13px] font-bold" style={{ color: pPos ? "#16A34A" : "#DC2626" }}>{p.pnl}</span>
                <span className="text-[12px]" style={{ color: parseFloat(p.delta) >= 0 ? "#2563EB" : "#EF4444" }}>{p.delta}</span>
                <span className="text-[12px]" style={{ color: tPos ? "#16A34A" : "#EF4444" }}>{p.theta}</span>
                <span className="text-[12px] text-[#6B7280]">{p.iv}</span>
              </div>
            );
          })}
          <div className="grid px-4 py-3 border-t-2 border-[#E5E7EB] bg-[#F9FAFB] items-center"
            style={{ gridTemplateColumns: COLS }}>
            <span className="text-[13px] font-bold text-[#111827]">Net Book</span>
            <span /><span /><span /><span /><span />
            <span className="text-[13px] font-bold text-[#16A34A]">+₹31,640</span>
            <span className="text-[13px] font-bold text-[#2563EB]">+0.87</span>
            <span className="text-[13px] font-bold text-[#EF4444]">-420/d</span>
            <span />
          </div>
        </div>
      </Panel>

      <div className="grid lg:grid-cols-3 gap-4">
        <Panel title="Delta Distribution by Underlying" delay={0.2}>
          <div className="space-y-5">
            {[
              { sym: "NIFTY 50",   delta: "+0.87", pct: 65, color: "#2563EB" },
              { sym: "BANK NIFTY", delta: "-0.31", pct: 35, color: "#60A5FA" },
            ].map((d) => (
              <div key={d.sym}>
                <div className="flex justify-between mb-1.5">
                  <span className="text-[13px] font-medium text-[#374151]">{d.sym}</span>
                  <span className="text-[12px] font-bold" style={{ color: d.color }}>Δ {d.delta}</span>
                </div>
                <div className="h-2 rounded-full bg-[#F3F4F6]">
                  <div className="h-full rounded-full" style={{ width: `${d.pct}%`, background: d.color }} />
                </div>
                <p className="text-[11px] text-[#9CA3AF] mt-1">{d.pct}% of portfolio delta exposure</p>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Greeks P&L Attribution" delay={0.25}>
          <div className="space-y-3.5">
            {[
              { g: "Delta",  contribution: "+₹22,400", pct: 70, color: "#2563EB", pos: true },
              { g: "Vega",   contribution: "+₹7,240",  pct: 23, color: "#6B7280", pos: true },
              { g: "Gamma",  contribution: "+₹2,420",  pct: 8,  color: "#22C55E", pos: true },
              { g: "Theta",  contribution: "-₹420",    pct: 1,  color: "#EF4444", pos: false },
            ].map((g) => (
              <div key={g.g} className="flex items-center gap-3">
                <span className="text-[12.5px] w-12 font-semibold text-[#374151]">{g.g}</span>
                <div className="flex-1 h-1.5 rounded-full bg-[#F3F4F6]">
                  <div className="h-full rounded-full" style={{ width: `${g.pct}%`, background: g.color }} />
                </div>
                <span className="text-[12.5px] font-bold w-20 text-right" style={{ color: g.pos ? "#16A34A" : "#DC2626" }}>{g.contribution}</span>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Margin & Risk Summary" delay={0.3}>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1.5">
                <span className="text-[12.5px] font-medium text-[#374151]">Margin Used</span>
                <span className="text-[12.5px] font-bold text-[#374151]">₹4.2L / ₹10L</span>
              </div>
              <div className="h-2 rounded-full bg-[#F3F4F6]">
                <div className="h-full rounded-full bg-[#2563EB]" style={{ width: "42%" }} />
              </div>
              <p className="text-[11px] text-[#9CA3AF] mt-1">42% utilised — ₹5.8L free margin available</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { l: "Open Positions", v: "4 active" },
                { l: "Risk Level",     v: "Medium" },
                { l: "Max Loss",       v: "-₹18,420" },
                { l: "Open P&L",       v: "+₹31,640" },
              ].map((m) => (
                <div key={m.l} className="rounded-xl p-3" style={{ background: "#F9FAFB", border: "1px solid #F3F4F6" }}>
                  <p className="text-[10px] text-[#9CA3AF] uppercase tracking-wide mb-0.5">{m.l}</p>
                  <p className="text-[13px] font-bold text-[#374151]">{m.v}</p>
                </div>
              ))}
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}

// ─── Stress Test ──────────────────────────────────────────────────────────────

const STRESS_CURVE = [
  { move: -500, pnl: -89200 },
  { move: -400, pnl: -71300 },
  { move: -300, pnl: -47600 },
  { move: -200, pnl: -24100 },
  { move: -100, pnl:  -3800 },
  { move:    0, pnl:  14200 },
  { move:  100, pnl:  27800 },
  { move:  200, pnl:  42000 },
  { move:  300, pnl:  54600 },
  { move:  400, pnl:  66200 },
  { move:  500, pnl:  78900 },
];

function StressFullScreen() {
  const CW = 580, LM = 58, INNER_W = CW - LM - 10;
  const MIN_PNL = -89200, PNL_RANGE = 78900 - MIN_PNL;
  const CHART_TOP = 18, CHART_H = 162;

  const toY = (pnl: number) => CHART_TOP + CHART_H - ((pnl - MIN_PNL) / PNL_RANGE) * CHART_H;
  const toX = (i: number) => LM + (i / (STRESS_CURVE.length - 1)) * INNER_W;

  const zeroY = toY(0);
  const zeroCrossX = toX(4) + (3800 / (3800 + 14200)) * (toX(5) - toX(4));

  const pts = STRESS_CURVE.map((d, i) => `${toX(i).toFixed(1)},${toY(d.pnl).toFixed(1)}`).join(" L ");
  const linePath = `M ${pts}`;

  const lossArea = `M ${toX(0)},${zeroY} L ${STRESS_CURVE.slice(0, 5).map((d, i) => `${toX(i).toFixed(1)},${toY(d.pnl).toFixed(1)}`).join(" L ")} L ${zeroCrossX.toFixed(1)},${zeroY} Z`;
  const gainArea = `M ${zeroCrossX.toFixed(1)},${zeroY} L ${STRESS_CURVE.slice(5).map((d, i) => `${toX(i + 5).toFixed(1)},${toY(d.pnl).toFixed(1)}`).join(" L ")} L ${toX(10).toFixed(1)},${zeroY} Z`;

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Current P&L",         value: "+₹14,200",     sub: "At today's Nifty level",          color: "#22C55E", delay: 0 },
          { label: "Loss at Nifty -300",   value: "-₹47,600",     sub: "3.3% of total portfolio value",   color: "#EF4444", delay: 0.06 },
          { label: "Break-even Point",     value: "Nifty 23,415", sub: "~85 points below current level",  color: "#6B7280", delay: 0.12 },
          { label: "Max Drawdown (-500)",  value: "-₹89,200",     sub: "6.2% loss in worst-case scenario",color: "#DC2626", delay: 0.18 },
        ].map((k) => <KpiCard key={k.label} {...k} />)}
      </div>

      <div className="grid lg:grid-cols-[1fr_380px] gap-4">
        <Panel title="Portfolio P&L vs Nifty Move — Full Scenario Range" delay={0.1}>
          <svg viewBox={`0 0 ${CW} ${CHART_TOP + CHART_H + 30}`} className="w-full" style={{ height: "230px" }}>
            {[-80000, -40000, 0, 40000, 80000].map((v) => {
              const y = toY(v);
              return (
                <g key={v}>
                  <line x1={LM} y1={y} x2={CW - 10} y2={y}
                    stroke={v === 0 ? "#9CA3AF" : "#F3F4F6"}
                    strokeWidth={v === 0 ? "1" : "0.5"}
                    strokeDasharray={v !== 0 ? "4,3" : "0"} />
                  <text x={LM - 4} y={y + 3.5} textAnchor="end" fill="#9CA3AF" fontSize="8.5">
                    {v === 0 ? "₹0" : (v > 0 ? "+" : "") + (v / 1000).toFixed(0) + "K"}
                  </text>
                </g>
              );
            })}
            <path d={lossArea} fill="#EF4444" fillOpacity="0.07" />
            <path d={gainArea} fill="#22C55E" fillOpacity="0.07" />
            <path d={linePath} fill="none" stroke="#2563EB" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx={zeroCrossX} cy={zeroY} r="4.5" fill="#fff" stroke="#6B7280" strokeWidth="1.8" />
            <circle cx={toX(5)} cy={toY(14200)} r="5.5" fill="#22C55E" stroke="#fff" strokeWidth="2" />
            <text x={toX(5)} y={toY(14200) - 10} textAnchor="middle" fill="#22C55E" fontSize="9" fontWeight="700">Today</text>
            <circle cx={toX(2)} cy={toY(-47600)} r="4.5" fill="#EF4444" stroke="#fff" strokeWidth="2" />
            <text x={toX(2)} y={toY(-47600) - 9} textAnchor="middle" fill="#EF4444" fontSize="8.5" fontWeight="600">-300pt</text>
            {STRESS_CURVE.map((d, i) => (
              <text key={d.move} x={toX(i)} y={CHART_TOP + CHART_H + 22} textAnchor="middle" fill="#9CA3AF" fontSize="8.5">
                {d.move > 0 ? "+" : ""}{d.move}
              </text>
            ))}
          </svg>
          <div className="mt-2 flex items-center gap-5 flex-wrap">
            {[
              { c: "#22C55E", l: "Today's position" },
              { c: "#6B7280", l: "Break-even ~23,415" },
              { c: "#EF4444", l: "Nifty -300 scenario" },
            ].map((m) => (
              <div key={m.l} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: m.c }} />
                <span className="text-[10.5px] text-[#6B7280]">{m.l}</span>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Position Impact at Nifty -300 Points" delay={0.15}>
          <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #F3F4F6" }}>
            <div className="grid bg-[#F9FAFB] px-3 py-2 text-[9.5px] font-semibold uppercase tracking-wide text-[#9CA3AF]"
              style={{ gridTemplateColumns: "1.6fr 0.9fr 0.7fr" }}>
              {["Position", "Impact", "Weight"].map((h) => <span key={h}>{h}</span>)}
            </div>
            {[
              { pos: "NIFTY CE Longs",    impact: "-₹28,400", pct: 60, pos_: false },
              { pos: "NIFTY PE Shorts",   impact: "-₹12,300", pct: 26, pos_: false },
              { pos: "BNKNIFTY CE Short", impact: "+₹8,100",  pct: 17, pos_: true  },
              { pos: "Other Positions",   impact: "-₹15,000", pct: 32, pos_: false },
            ].map((r, i) => (
              <div key={i} className="grid px-3 py-3 border-t border-[#F3F4F6] items-center"
                style={{ gridTemplateColumns: "1.6fr 0.9fr 0.7fr" }}>
                <span className="text-[12px] font-medium text-[#374151]">{r.pos}</span>
                <span className="text-[12.5px] font-semibold" style={{ color: r.pos_ ? "#16A34A" : "#DC2626" }}>{r.impact}</span>
                <div>
                  <div className="h-1.5 rounded-full bg-[#F3F4F6] mb-1">
                    <div className="h-full rounded-full" style={{ width: `${r.pct}%`, background: r.pos_ ? "#22C55E" : "#EF4444" }} />
                  </div>
                  <span className="text-[10px] text-[#9CA3AF]">{r.pct}%</span>
                </div>
              </div>
            ))}
            <div className="grid px-3 py-3 border-t-2 border-[#E5E7EB] bg-[#F9FAFB]"
              style={{ gridTemplateColumns: "1.6fr 0.9fr 0.7fr" }}>
              <span className="text-[13px] font-bold text-[#111827]">Net at -300pts</span>
              <span className="text-[13.5px] font-bold text-[#DC2626]">-₹47,600</span>
              <span className="text-[11px] text-[#9CA3AF]">total</span>
            </div>
          </div>
        </Panel>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { t: "Bear Case  (Nifty -500)", pnl: "-₹89,200",  d: "6.2% portfolio drawdown — extreme tail risk event", c: "#DC2626", delay: 0.28 },
          { t: "Base Case  (Nifty -300)", pnl: "-₹47,600",  d: "3.3% loss — within manageable risk parameters",    c: "#EF4444", delay: 0.35 },
          { t: "Bull Case  (Nifty +200)", pnl: "+₹42,000",  d: "2.9% gain — upside from current portfolio",        c: "#22C55E", delay: 0.42 },
        ].map((c) => (
          <motion.div key={c.t} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: c.delay }}
            className="rounded-2xl p-5 bg-white" style={{ border: "1px solid #E5E7EB" }}>
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.07em] text-[#9CA3AF] mb-2">{c.t}</p>
            <p className="text-[22px] font-bold mb-2" style={{ color: c.c }}>{c.pnl}</p>
            <p className="text-[11.5px] text-[#6B7280] leading-relaxed">{c.d}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ─── Export ───────────────────────────────────────────────────────────────────

export function FullScreenDashboard({ id, question }: { id: DashboardId; question: string }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3 px-4 py-3 rounded-2xl" style={{ background: "#EFF6FF", border: "1px solid #BFDBFE" }}>
        <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0" style={{ background: "#2563EB" }}>
          <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
            <path d="M7 1L8.8 5.4H13.6L9.8 8L11.4 12.5L7 9.8L2.6 12.5L4.2 8L0.4 5.4H5.2L7 1Z" fill="white" />
          </svg>
        </div>
        <p className="text-[13px] text-[#374151] flex-1 italic">&ldquo;{question}&rdquo;</p>
        <div className="flex items-center gap-1.5 shrink-0">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 6l3 3 5-6" stroke="#22C55E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-[12px] font-bold text-[#22C55E]">Dashboard Built</span>
        </div>
      </div>

      {id === "fii-flows"      && <FIIFullScreen />}
      {id === "options-greeks" && <GreeksFullScreen />}
      {id === "stress-test"    && <StressFullScreen />}
    </div>
  );
}
