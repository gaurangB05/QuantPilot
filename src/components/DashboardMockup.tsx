"use client";

import { motion } from "framer-motion";

function Sparkline({ data, color = "#2563EB", gradId, height = 44 }: {
  data: number[]; color?: string; gradId: string; height?: number;
}) {
  const W = 200; const H = height;
  const min = Math.min(...data); const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * W;
    const y = H - ((v - min) / range) * (H - 4) - 2;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const line = `M ${pts.join(" L ")}`;
  const area = `${line} L ${W},${H} L 0,${H} Z`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.12" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gradId})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const portfolioData = [264, 268, 262, 272, 270, 276, 274, 280, 279, 284, 286, 283, 288, 290, 284];
const pnlData      = [0, 4, 11, 7, 14, 10, 18, 22, 18, 26, 30, 26, 34, 39, 42];

const card: React.CSSProperties = {
  background: "#F8FAFC",
  border: "1px solid #E5E7EB",
  borderRadius: "10px",
};

export default function DashboardMockup() {
  return (
    <div className="relative w-full max-w-[600px] select-none">

      {/* Browser chrome */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
        className="rounded-2xl overflow-hidden"
        style={{
          background: "#ffffff",
          border: "1px solid #E5E7EB",
          boxShadow: "0 20px 60px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.04)",
        }}
      >
        {/* Title bar */}
        <div className="flex items-center gap-2 px-4 py-3 bg-[#F8FAFC] border-b border-[#E5E7EB]">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#FCA5A5]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#FCD34D]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#6EE7B7]" />
          </div>
          <div className="flex-1 mx-3">
            <div className="bg-white border border-[#E5E7EB] rounded-md px-3 py-1 text-center">
              <span className="text-[10px] text-[#9CA3AF]">app.tradeos.io/dashboard</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
            <span className="text-[9px] text-[#6B7280] font-medium">Live</span>
          </div>
        </div>

        {/* Dashboard body */}
        <div className="p-3 bg-white">

          {/* Stats row */}
          <div className="grid grid-cols-4 gap-2 mb-3">
            {[
              { label: "Portfolio Value", value: "₹28.4L",  sub: "+2.4% today",  subColor: "#16A34A" },
              { label: "Today's P&L",     value: "+₹42K",   sub: "+1.8% return", subColor: "#16A34A" },
              { label: "Open Positions",  value: "8",       sub: "4 options",    subColor: "#6B7280" },
              { label: "Strategies",      value: "12",      sub: "3 paused",     subColor: "#6B7280" },
            ].map((s) => (
              <div key={s.label} style={card} className="p-2.5">
                <p className="text-[8px] text-[#9CA3AF] font-medium uppercase tracking-wide mb-1">{s.label}</p>
                <p className="text-[13px] font-bold text-[#111827] leading-none">{s.value}</p>
                <p className="text-[8px] mt-1 font-medium" style={{ color: s.subColor }}>{s.sub}</p>
              </div>
            ))}
          </div>

          {/* Main grid */}
          <div className="grid grid-cols-5 gap-2">

            {/* Portfolio chart */}
            <div className="col-span-3 p-3" style={card}>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-[8px] text-[#9CA3AF] uppercase tracking-wide font-medium">Portfolio Performance</p>
                  <p className="text-sm font-bold text-[#111827] mt-0.5">₹28,42,350</p>
                </div>
                <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full text-[#15803D] bg-[#DCFCE7]">
                  ↑ 2.4%
                </span>
              </div>
              <div className="h-[44px]">
                <Sparkline data={portfolioData} color="#2563EB" gradId="portGrad" height={44} />
              </div>
              <div className="flex gap-1 mt-2">
                {["1D", "1W", "1M", "3M"].map((t, i) => (
                  <button key={t} className="text-[8px] px-2 py-0.5 rounded-md transition-colors"
                    style={i === 0
                      ? { background: "#EFF6FF", color: "#2563EB", border: "1px solid #BFDBFE" }
                      : { color: "#9CA3AF" }}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Right col */}
            <div className="col-span-2 flex flex-col gap-2">
              <div className="p-2.5" style={card}>
                <p className="text-[8px] text-[#9CA3AF] uppercase tracking-wide font-medium mb-2">Connected Brokers</p>
                <div className="space-y-1.5">
                  {[
                    { name: "Zerodha", val: "₹8.4L",  color: "#10B981" },
                    { name: "ICICI Direct", val: "₹12.5L", color: "#10B981" },
                    { name: "Angel One", val: "₹7.5L",  color: "#10B981" },
                  ].map((b) => (
                    <div key={b.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: b.color }} />
                        <span className="text-[9.5px] text-[#374151] font-medium">{b.name}</span>
                      </div>
                      <span className="text-[9px] text-[#6B7280]">{b.val}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-2.5 flex-1" style={card}>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[8px] text-[#9CA3AF] uppercase tracking-wide font-medium">Today&apos;s P&L</p>
                  <span className="text-[8px] font-semibold text-[#16A34A] flex items-center gap-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] inline-block animate-pulse" />
                    LIVE
                  </span>
                </div>
                <p className="text-[15px] font-bold text-[#16A34A] leading-none">+₹42,350</p>
                <div className="h-6 mt-1.5">
                  <Sparkline data={pnlData} color="#16A34A" gradId="pnlGrad" height={24} />
                </div>
              </div>
            </div>
          </div>

          {/* Bottom grid */}
          <div className="grid grid-cols-5 gap-2 mt-2">
            <div className="col-span-2 p-2.5" style={card}>
              <p className="text-[8px] text-[#9CA3AF] uppercase tracking-wide font-medium mb-2">Allocation</p>
              <div className="space-y-2">
                {[
                  { label: "Options",  pct: 45, color: "#2563EB", track: "#EFF6FF" },
                  { label: "Futures",  pct: 30, color: "#60A5FA", track: "#EFF6FF" },
                  { label: "Equity",   pct: 25, color: "#10B981", track: "#F0FDF4" },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between mb-0.5">
                      <span className="text-[9px] text-[#374151]">{item.label}</span>
                      <span className="text-[9px] text-[#6B7280]">{item.pct}%</span>
                    </div>
                    <div className="h-[3px] rounded-full overflow-hidden" style={{ background: item.track }}>
                      <div className="h-full rounded-full" style={{ width: `${item.pct}%`, background: item.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="col-span-2 p-2.5" style={card}>
              <p className="text-[8px] text-[#9CA3AF] uppercase tracking-wide font-medium mb-2">Strategies</p>
              <div className="space-y-1.5">
                {[
                  { name: "Iron Condor",   ret: "+2.4%", pos: true },
                  { name: "Trend Follow",  ret: "+1.8%", pos: true },
                  { name: "Options Scalp", ret: "-0.3%", pos: false },
                ].map((s) => (
                  <div key={s.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="w-1 h-3 rounded-full" style={{ background: s.pos ? "#2563EB" : "#F87171" }} />
                      <span className="text-[9px] text-[#374151]">{s.name}</span>
                    </div>
                    <span className="text-[9px] font-semibold" style={{ color: s.pos ? "#16A34A" : "#DC2626" }}>{s.ret}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="col-span-1 p-2.5" style={card}>
              <p className="text-[8px] text-[#9CA3AF] uppercase tracking-wide font-medium mb-1.5">Options</p>
              <p className="text-[8px] text-[#6B7280] mb-1.5">NIFTY 23000</p>
              <div className="space-y-1">
                <div className="rounded-lg px-1.5 py-1 bg-[#F0FDF4] border border-[#BBF7D0]">
                  <p className="text-[8px] text-[#15803D] font-medium">CE 145.50</p>
                  <p className="text-[7px] text-[#16A34A]">+12.30 ↑</p>
                </div>
                <div className="rounded-lg px-1.5 py-1 bg-[#FEF2F2] border border-[#FECACA]">
                  <p className="text-[8px] text-[#DC2626] font-medium">PE 98.25</p>
                  <p className="text-[7px] text-[#EF4444]">-8.50 ↓</p>
                </div>
              </div>
            </div>
          </div>

          {/* Trade log */}
          <div className="mt-2 p-2.5" style={card}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[8px] text-[#9CA3AF] uppercase tracking-wide font-medium">Recent Activity</p>
              <span className="text-[8.5px] text-[#2563EB] font-medium">View all →</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { action: "BUY",  asset: "NIFTY 23200 CE", detail: "@180 · 10 lots", time: "09:45 AM", ac: "#DCFCE7", at: "#15803D" },
                { action: "SELL", asset: "BANKNIFTY 52000 PE", detail: "@220 · 5 lots", time: "10:12 AM", ac: "#EFF6FF", at: "#1D4ED8" },
                { action: "SL",   asset: "HDFC Futures", detail: "₹1,640 · -₹2,400",  time: "11:30 AM", ac: "#FEF2F2", at: "#DC2626" },
              ].map((entry) => (
                <div key={entry.asset} className="flex items-start gap-2">
                  <span className="text-[7.5px] font-bold px-1.5 py-0.5 rounded shrink-0 mt-0.5"
                    style={{ color: entry.at, background: entry.ac }}>
                    {entry.action}
                  </span>
                  <div>
                    <p className="text-[9px] text-[#111827] font-medium leading-none">{entry.asset}</p>
                    <p className="text-[8px] text-[#6B7280] mt-0.5">{entry.detail}</p>
                    <p className="text-[7.5px] text-[#9CA3AF]">{entry.time}</p>
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
