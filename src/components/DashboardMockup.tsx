"use client";

import { motion } from "framer-motion";

// ─── Sparkline SVG ────────────────────────────────────────────────────────────

function Sparkline({
  data,
  color = "#2563eb",
  gradId,
  height = 40,
}: {
  data: number[];
  color?: string;
  gradId: string;
  height?: number;
}) {
  const W = 200;
  const H = height;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * W;
    const y = H - ((v - min) / range) * (H - 4) - 2;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const line = `M ${pts.join(" L ")}`;
  const area = `${line} L ${W},${H} L 0,${H} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0.01" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gradId})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="1.5"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Floating card ────────────────────────────────────────────────────────────

function FloatingCard({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={`absolute z-30 ${className}`}
      animate={{ y: [0, -9, 0] }}
      transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut", delay }}
    >
      <div
        className="rounded-2xl px-3 py-2.5 min-w-[148px]"
        style={{
          background: "#ffffff",
          border: "1px solid rgba(0, 0, 0, 0.08)",
          boxShadow: "0 8px 24px rgba(0,0,0,0.10), 0 2px 6px rgba(0,0,0,0.06)",
        }}
      >
        {children}
      </div>
    </motion.div>
  );
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const portfolioData = [264, 268, 262, 272, 270, 276, 274, 280, 279, 284, 286, 283, 288, 290, 284];
const pnlData = [0, 4, 11, 7, 14, 10, 18, 22, 18, 26, 30, 26, 34, 39, 42];

// ─── Card style helper ────────────────────────────────────────────────────────

const card: React.CSSProperties = {
  background: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: "12px",
};

// ─── Main component ───────────────────────────────────────────────────────────

export default function DashboardMockup() {
  return (
    <div className="relative w-full max-w-[600px] select-none">
      {/* Ambient glow */}
      <div
        className="absolute inset-0 -z-10 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 70% 60% at 55% 45%, rgba(37,99,235,0.1) 0%, transparent 70%)",
          filter: "blur(40px)",
          transform: "scale(1.15)",
        }}
      />

      {/* ── Floating cards ── */}

      {/* Broker Connected — top-left */}
      <FloatingCard delay={0} className="-top-7 -left-4 lg:-left-10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 bg-emerald-100">
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true">
              <path d="M1.5 5.5L4.5 8.5L9.5 2.5" stroke="#059669" strokeWidth="1.6"
                strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <p className="text-[9px] text-slate-400 font-medium tracking-wide uppercase">Status</p>
            <p className="text-[11px] text-slate-800 font-semibold leading-tight">Broker Connected</p>
          </div>
        </div>
      </FloatingCard>

      {/* Risk Alert — right */}
      <FloatingCard delay={0.9} className="top-[110px] -right-4 lg:-right-8">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 bg-amber-100">
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true">
              <path d="M5.5 2V6.5" stroke="#d97706" strokeWidth="1.6" strokeLinecap="round" />
              <circle cx="5.5" cy="8.5" r="0.8" fill="#d97706" />
            </svg>
          </div>
          <div>
            <p className="text-[9px] text-slate-400 font-medium tracking-wide uppercase">Alert</p>
            <p className="text-[11px] text-amber-600 font-semibold leading-tight">Risk Alert Detected</p>
          </div>
        </div>
      </FloatingCard>

      {/* +₹42,350 Today — bottom-left */}
      <FloatingCard delay={1.5} className="-bottom-7 left-8 lg:left-14">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 bg-emerald-100">
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true">
              <path d="M1.5 8L5.5 3L9.5 5.5" stroke="#059669" strokeWidth="1.6"
                strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <p className="text-[9px] text-slate-400 font-medium tracking-wide uppercase">Today&apos;s Gain</p>
            <p className="text-[11px] text-emerald-600 font-bold leading-tight">+₹42,350</p>
          </div>
        </div>
      </FloatingCard>

      {/* 5 Accounts Synced — top-right */}
      <FloatingCard delay={2.2} className="-top-7 right-12 lg:right-16">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 bg-blue-100">
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true">
              <path d="M5.5 1C3.29 1 1.5 2.79 1.5 5s1.79 4 4 4 4-1.79 4-4"
                stroke="#2563eb" strokeWidth="1.4" strokeLinecap="round" />
              <path d="M7.5 1L9.5 3H7.5" stroke="#2563eb" strokeWidth="1.4"
                strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <p className="text-[9px] text-slate-400 font-medium tracking-wide uppercase">Sync</p>
            <p className="text-[11px] text-blue-600 font-semibold leading-tight">5 Accounts Synced</p>
          </div>
        </div>
      </FloatingCard>

      {/* ── MacBook-style window ── */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.35, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
        className="rounded-2xl overflow-hidden"
        style={{
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          boxShadow: "0 24px 60px rgba(0,0,0,0.12), 0 8px 20px rgba(0,0,0,0.06), 0 0 0 0.5px rgba(0,0,0,0.04)",
        }}
      >
        {/* Window chrome */}
        <div
          className="flex items-center gap-2 px-4 py-3"
          style={{
            background: "#f8fafc",
            borderBottom: "1px solid #e2e8f0",
          }}
        >
          <div className="flex items-center gap-[6px]">
            <div className="w-3 h-3 rounded-full bg-rose-400" />
            <div className="w-3 h-3 rounded-full bg-amber-400" />
            <div className="w-3 h-3 rounded-full bg-emerald-400" />
          </div>
          <div className="flex-1 mx-4">
            <div
              className="rounded-md px-3 py-1 text-center"
              style={{ background: "#ffffff", border: "1px solid #e2e8f0" }}
            >
              <span className="text-[10px] text-slate-400">app.tradeos.io/dashboard</span>
            </div>
          </div>
          <div
            className="w-5 h-5 rounded flex items-center justify-center"
            style={{ background: "#f1f5f9", border: "1px solid #e2e8f0" }}
          >
            <div className="w-2 h-2 rounded-sm border border-slate-300" />
          </div>
        </div>

        {/* Dashboard body */}
        <div className="p-3" style={{ background: "#f8fafc" }}>

          {/* ── Stats Row ── */}
          <div className="grid grid-cols-4 gap-2 mb-3">
            {[
              { label: "Portfolio Value", value: "₹28,42,350", sub: "+2.4% today", valueColor: "#0f172a", subColor: "#059669" },
              { label: "Today's P&L", value: "+₹42,350", sub: "+1.8% return", valueColor: "#059669", subColor: "#10b981" },
              { label: "Open Positions", value: "8", sub: "4 opt · 4 fut", valueColor: "#2563eb", subColor: "#64748b" },
              { label: "Active Strategies", value: "12", sub: "3 paused", valueColor: "#0f172a", subColor: "#64748b" },
            ].map((s) => (
              <div key={s.label} style={card} className="p-2.5">
                <p className="text-[8.5px] text-slate-400 font-medium uppercase tracking-wide mb-1">{s.label}</p>
                <p className="text-[13px] font-bold leading-none" style={{ color: s.valueColor }}>{s.value}</p>
                <p className="text-[8px] mt-1" style={{ color: s.subColor }}>{s.sub}</p>
              </div>
            ))}
          </div>

          {/* ── Main Grid ── */}
          <div className="grid grid-cols-5 gap-2">

            {/* Portfolio chart — 3 cols */}
            <div className="col-span-3 p-3" style={card}>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-[8.5px] text-slate-400 uppercase tracking-wide">Portfolio Performance</p>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">₹28,42,350</p>
                </div>
                <span
                  className="text-[9px] font-semibold px-2 py-0.5 rounded-full text-emerald-700 bg-emerald-100"
                  style={{ border: "1px solid #bbf7d0" }}
                >
                  ↑ +2.4%
                </span>
              </div>
              <div className="h-[50px]">
                <Sparkline data={portfolioData} color="#2563eb" gradId="portGrad" height={50} />
              </div>
              <div className="flex gap-2 mt-2">
                {["1D", "1W", "1M", "3M"].map((t, i) => (
                  <button
                    key={t}
                    className="text-[8px] px-2 py-0.5 rounded-md transition-colors"
                    style={
                      i === 0
                        ? { background: "#dbeafe", color: "#1d4ed8", border: "1px solid #bfdbfe" }
                        : { color: "#94a3b8" }
                    }
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Right column — 2 cols */}
            <div className="col-span-2 flex flex-col gap-2">

              {/* Broker accounts */}
              <div className="p-2.5" style={card}>
                <p className="text-[8.5px] text-slate-400 uppercase tracking-wide mb-2">Broker Accounts</p>
                <div className="space-y-1.5">
                  {[
                    { name: "Zerodha", val: "₹8,42,350" },
                    { name: "ICICI Direct", val: "₹12,50,000" },
                    { name: "Angel One", val: "₹7,50,000" },
                  ].map((b) => (
                    <div key={b.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span className="text-[9.5px] text-slate-700 font-medium">{b.name}</span>
                      </div>
                      <span className="text-[9px] text-slate-400">{b.val}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Today's PnL mini */}
              <div className="p-2.5 flex-1" style={card}>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[8.5px] text-slate-400 uppercase tracking-wide">Today&apos;s P&amp;L</p>
                  <span className="text-[8px] font-semibold text-emerald-600 flex items-center gap-0.5">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    LIVE
                  </span>
                </div>
                <p className="text-[15px] font-bold text-emerald-600 leading-none">+₹42,350</p>
                <div className="h-7 mt-1.5">
                  <Sparkline data={pnlData} color="#059669" gradId="pnlGrad" height={28} />
                </div>
              </div>
            </div>
          </div>

          {/* ── Bottom Grid ── */}
          <div className="grid grid-cols-5 gap-2 mt-2">

            {/* Risk Exposure — 2 cols */}
            <div className="col-span-2 p-2.5" style={card}>
              <p className="text-[8.5px] text-slate-400 uppercase tracking-wide mb-2">Risk Exposure</p>
              <div className="space-y-2">
                {[
                  { label: "Options", pct: 45, color: "#2563eb", trackColor: "#dbeafe" },
                  { label: "Futures", pct: 30, color: "#7c3aed", trackColor: "#ede9fe" },
                  { label: "Equity", pct: 25, color: "#059669", trackColor: "#d1fae5" },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between mb-0.5">
                      <span className="text-[9px] text-slate-600">{item.label}</span>
                      <span className="text-[9px] text-slate-400">{item.pct}%</span>
                    </div>
                    <div className="h-[3px] rounded-full overflow-hidden" style={{ background: item.trackColor }}>
                      <div className="h-full rounded-full" style={{ width: `${item.pct}%`, background: item.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Strategy Performance — 2 cols */}
            <div className="col-span-2 p-2.5" style={card}>
              <p className="text-[8.5px] text-slate-400 uppercase tracking-wide mb-2">Strategy Performance</p>
              <div className="space-y-1.5">
                {[
                  { name: "Iron Condor", pnl: "+2.4%", pos: true },
                  { name: "Trend Follow", pnl: "+1.8%", pos: true },
                  { name: "Options Scalp", pnl: "-0.3%", pos: false },
                ].map((s) => (
                  <div key={s.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="w-1 h-3 rounded-full" style={{ background: s.pos ? "#2563eb" : "#f43f5e" }} />
                      <span className="text-[9px] text-slate-600">{s.name}</span>
                    </div>
                    <span className="text-[9px] font-semibold" style={{ color: s.pos ? "#059669" : "#e11d48" }}>
                      {s.pnl}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Option Chain — 1 col */}
            <div className="col-span-1 p-2.5" style={card}>
              <p className="text-[8.5px] text-slate-400 uppercase tracking-wide mb-1.5">Options</p>
              <p className="text-[8px] text-slate-400 mb-1.5">NIFTY 23000</p>
              <div className="space-y-1">
                <div className="rounded-md px-1.5 py-1 bg-emerald-50 border border-emerald-200">
                  <p className="text-[8px] text-emerald-700 font-medium">CE 145.50</p>
                  <p className="text-[7px] text-emerald-500">+12.30 ↑</p>
                </div>
                <div className="rounded-md px-1.5 py-1 bg-rose-50 border border-rose-200">
                  <p className="text-[8px] text-rose-600 font-medium">PE 98.25</p>
                  <p className="text-[7px] text-rose-400">-8.50 ↓</p>
                </div>
              </div>
            </div>
          </div>

          {/* ── Trade Journal ── */}
          <div className="mt-2 p-2.5" style={card}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[8.5px] text-slate-400 uppercase tracking-wide">Trade Journal</p>
              <span className="text-[8.5px] text-blue-600 cursor-pointer hover:text-blue-800 transition-colors">
                View All →
              </span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { action: "BUY", asset: "NIFTY 23200 CE", detail: "@180 · 10 lots", time: "09:45 AM",
                  actionColor: "#059669", actionBg: "#d1fae5" },
                { action: "SELL", asset: "BANKNIFTY 52000 PE", detail: "@220 · 5 lots", time: "10:12 AM",
                  actionColor: "#2563eb", actionBg: "#dbeafe" },
                { action: "SL", asset: "HDFC Futures", detail: "₹1,640 · -₹2,400", time: "11:30 AM",
                  actionColor: "#e11d48", actionBg: "#ffe4e6" },
              ].map((entry) => (
                <div key={entry.asset} className="flex items-start gap-2">
                  <span
                    className="text-[7.5px] font-bold px-1.5 py-0.5 rounded shrink-0 mt-0.5"
                    style={{ color: entry.actionColor, background: entry.actionBg }}
                  >
                    {entry.action}
                  </span>
                  <div>
                    <p className="text-[9px] text-slate-800 font-medium leading-none">{entry.asset}</p>
                    <p className="text-[8px] text-slate-400 mt-0.5">{entry.detail}</p>
                    <p className="text-[7.5px] text-slate-300">{entry.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </motion.div>
    </div>
  );
}
