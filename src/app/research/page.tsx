"use client";

import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";

function fade(delay = 0) {
  return {
    initial: { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  };
}

// ─── Mini Previews ────────────────────────────────────────────────────────────

function FIIPreview() {
  const bars = [1200, -800, 2100, -400, 1800, 3200, -1100, 900, -600, 2400, -1900, 1500, 2800, -300];
  const max = Math.max(...bars.map(Math.abs));
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "#fff", border: "1px solid #E5E7EB", boxShadow: "0 12px 40px rgba(0,0,0,0.07)" }}>
      <div className="px-5 py-4 border-b border-[#F5F5F5] flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wide">FII / DII Flow Tracker</p>
          <p className="text-[13px] font-semibold text-[#111827] mt-0.5">14-day institutional activity</p>
        </div>
        <span className="flex items-center gap-1 text-[10px] font-semibold text-[#22C55E]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse inline-block" />LIVE
        </span>
      </div>
      <div className="px-5 py-5">
        <div className="flex items-end gap-1 h-[80px] mb-4">
          {bars.map((v, i) => (
            <div key={i} className="flex-1 flex items-end justify-center h-full">
              <div className="w-full rounded-sm"
                style={{ height: `${(Math.abs(v) / max) * 100}%`, background: v > 0 ? "#22C55E" : "#EF4444", opacity: 0.85, minHeight: "3px" }} />
            </div>
          ))}
        </div>
        <div className="flex gap-6 pt-3 border-t border-[#F5F5F5]">
          {[
            { l: "FII Net", v: "+₹8,420 Cr", c: "#16A34A" },
            { l: "DII Net", v: "+₹3,210 Cr", c: "#16A34A" },
            { l: "Net", v: "+₹11,630 Cr", c: "#2563EB" },
          ].map(m => (
            <div key={m.l}>
              <p className="text-[9.5px] text-[#9CA3AF] font-medium">{m.l}</p>
              <p className="text-[12px] font-bold mt-0.5" style={{ color: m.c }}>{m.v}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function OIPreview() {
  const rows = [
    { strike: "23200 CE", oi: 78, iv: "14.2%", ltp: "145.50", chg: "+12.3", up: true },
    { strike: "23000 CE", oi: 92, iv: "13.8%", ltp: "188.30", chg: "+8.1",  up: true },
    { strike: "22800 PE", oi: 65, iv: "15.6%", ltp: "112.40", chg: "-6.2",  up: false },
    { strike: "23000 PE", oi: 88, iv: "14.9%", ltp: "98.25",  chg: "-9.8",  up: false },
  ];
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "#fff", border: "1px solid #E5E7EB", boxShadow: "0 12px 40px rgba(0,0,0,0.07)" }}>
      <div className="px-5 py-4 border-b border-[#F5F5F5]">
        <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wide">Options Chain</p>
        <p className="text-[13px] font-semibold text-[#111827] mt-0.5">NIFTY · Live OI &amp; IV</p>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-4 gap-2 mb-2 px-1">
          {["Strike", "OI", "IV", "LTP"].map(h => (
            <p key={h} className="text-[9px] font-bold text-[#9CA3AF] uppercase tracking-wide">{h}</p>
          ))}
        </div>
        <div className="space-y-1.5">
          {rows.map(r => (
            <div key={r.strike} className="grid grid-cols-4 gap-2 items-center px-1">
              <p className="text-[11px] font-semibold text-[#374151]">{r.strike}</p>
              <div className="h-[6px] rounded-full bg-[#F3F4F6] overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${r.oi}%`, background: "#2563EB" }} />
              </div>
              <p className="text-[10px] text-[#6B7280]">{r.iv}</p>
              <div>
                <p className="text-[11px] font-bold text-[#111827]">{r.ltp}</p>
                <p className="text-[9px] font-medium" style={{ color: r.up ? "#16A34A" : "#DC2626" }}>{r.chg}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function HeatmapPreview() {
  const sectors = [
    { name: "IT",     val: "+2.4%", color: "#16A34A", bg: "#F0FDF4" },
    { name: "BFSI",   val: "+1.8%", color: "#16A34A", bg: "#DCFCE7" },
    { name: "Auto",   val: "+0.6%", color: "#16A34A", bg: "#F0FDF4" },
    { name: "Pharma", val: "-0.4%", color: "#DC2626", bg: "#FEF2F2" },
    { name: "Energy", val: "-1.2%", color: "#DC2626", bg: "#FEE2E2" },
    { name: "FMCG",   val: "+0.2%", color: "#6B7280", bg: "#F8FAFC" },
  ];
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "#fff", border: "1px solid #E5E7EB", boxShadow: "0 12px 40px rgba(0,0,0,0.07)" }}>
      <div className="px-5 py-4 border-b border-[#F5F5F5]">
        <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wide">Sector Rotation Map</p>
        <p className="text-[13px] font-semibold text-[#111827] mt-0.5">Today&apos;s FII sector flows</p>
      </div>
      <div className="p-4 grid grid-cols-3 gap-2">
        {sectors.map(s => (
          <div key={s.name} className="p-3 rounded-xl text-center" style={{ background: s.bg }}>
            <p className="text-[10px] font-semibold text-[#374151] mb-0.5">{s.name}</p>
            <p className="text-[13px] font-bold" style={{ color: s.color }}>{s.val}</p>
          </div>
        ))}
      </div>
      <div className="px-5 pb-4">
        <p className="text-[10px] text-[#9CA3AF] text-center">FII flows by sector · intraday</p>
      </div>
    </div>
  );
}

function FODerivativesPreview() {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "#fff", border: "1px solid #E5E7EB", boxShadow: "0 12px 40px rgba(0,0,0,0.07)" }}>
      <div className="px-5 py-4 border-b border-[#F5F5F5]">
        <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wide">F&amp;O Derivatives</p>
        <p className="text-[13px] font-semibold text-[#111827] mt-0.5">Key market metrics</p>
      </div>
      <div className="p-4 grid grid-cols-2 gap-3">
        {[
          { label: "Rollover %", val: "68.4%", sub: "vs 61.2% last expiry", up: true },
          { label: "Cost of Carry", val: "0.82%", sub: "annualised basis", up: true },
          { label: "Futures Basis", val: "+48 pts", sub: "premium to spot", up: true },
          { label: "PCR OI", val: "1.24", sub: "bullish above 1.0", up: true },
        ].map(m => (
          <div key={m.label} className="p-3 rounded-xl" style={{ background: "#F8FAFC", border: "1px solid #E5E7EB" }}>
            <p className="text-[9.5px] text-[#9CA3AF] font-medium mb-1">{m.label}</p>
            <p className="text-[15px] font-bold text-[#111827]">{m.val}</p>
            <p className="text-[9px] text-[#6B7280] mt-0.5">{m.sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Modules ──────────────────────────────────────────────────────────────────

const modules = [
  {
    tag: "Institutional",
    tagColor: "#2563EB",
    tagBg: "#EFF6FF",
    tagBorder: "#BFDBFE",
    title: "FII/DII Flow Tracker",
    headline: "Know where institutions are putting their money — every single day.",
    bullets: [
      "Net FII & DII flows across cash equity and F&O segments",
      "60-day trend with daily granularity",
      "Correlation with Nifty price movement",
      "Top 5 highest inflow/outflow days in any period",
    ],
    link: "#",
    preview: <FIIPreview />,
    reverse: false,
  },
  {
    tag: "Options",
    tagColor: "#7C3AED",
    tagBg: "#F5F3FF",
    tagBorder: "#DDD6FE",
    title: "Options Chain Intelligence",
    headline: "See the full options chain the way professionals do.",
    bullets: [
      "Live OI and OI change for every strike",
      "IV percentile with historical context",
      "Put/Call ratio by strike and overall PCR",
      "Max pain, unwinding, and buildup signals",
    ],
    link: "#",
    preview: <OIPreview />,
    reverse: true,
  },
  {
    tag: "Sectors",
    tagColor: "#059669",
    tagBg: "#ECFDF5",
    tagBorder: "#A7F3D0",
    title: "Sector Rotation Map",
    headline: "Find out which sectors institutions are rotating into right now.",
    bullets: [
      "FII buying/selling broken down by 6 major sectors",
      "Daily and weekly rotation momentum scores",
      "Relative strength vs Nifty for each sector",
      "Alert when a sector sees unusual institutional activity",
    ],
    link: "#",
    preview: <HeatmapPreview />,
    reverse: false,
  },
  {
    tag: "Derivatives",
    tagColor: "#DC2626",
    tagBg: "#FEF2F2",
    tagBorder: "#FECACA",
    title: "F&O Derivatives Dashboard",
    headline: "The market internals serious F&O traders track — all in one view.",
    bullets: [
      "Rollover data with comparison to previous expiry",
      "Cost of carry and futures basis signals",
      "Put-call ratio by OI and volume",
      "Unusual open interest buildup detection",
    ],
    link: "#",
    preview: <FODerivativesPreview />,
    reverse: true,
  },
];

const articles = [
  { date: "Jul 08, 2026", tag: "FII Flows", title: "FII turns net buyer for 5 consecutive sessions — what it means for Nifty", time: "4 min read" },
  { date: "Jul 07, 2026", tag: "Options", title: "PCR above 1.2 — historically bullish signal or false hope?", time: "6 min read" },
  { date: "Jul 05, 2026", tag: "Risk", title: "How to stress test your F&O book before every expiry", time: "5 min read" },
  { date: "Jul 03, 2026", tag: "Strategy", title: "Iron condor vs strangle — which performed better in high VIX markets?", time: "7 min read" },
];

export default function ResearchPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden py-20 sm:py-28"
        style={{ background: "radial-gradient(ellipse 80% 50% at 50% 0%, #F5F3FF 0%, #ffffff 70%)" }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold mb-6"
              style={{ background: "#F5F3FF", color: "#7C3AED", border: "1px solid #DDD6FE" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-[#7C3AED] animate-pulse inline-block" />
              Research Intelligence
            </span>
          </motion.div>

          <motion.h1
            className="text-[2.5rem] sm:text-5xl font-bold text-[#111827] tracking-tight leading-[1.1] mb-5"
            initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}>
            Research-grade intelligence.<br />
            <span className="text-[#7C3AED]">Trader-simple interface.</span>
          </motion.h1>

          <motion.p
            className="text-[16px] text-[#6B7280] leading-relaxed mb-8 max-w-xl mx-auto"
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.16 }}>
            FII flows, options chain, sector rotation, derivatives internals — all live, all in one place, all built for action.
          </motion.p>

          <motion.div className="flex flex-col sm:flex-row items-center justify-center gap-3"
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.24 }}>
            <a href="/request-access"
              className="px-6 py-3 rounded-xl text-[14px] font-semibold text-white"
              style={{ background: "linear-gradient(135deg, #7C3AED, #A78BFA)", boxShadow: "0 4px 18px rgba(124,58,237,0.28)" }}>
              Get Research Access — Free
            </a>
            <a href="/features"
              className="px-6 py-3 rounded-xl text-[14px] font-semibold text-[#374151]"
              style={{ border: "1px solid #E5E7EB", background: "white" }}>
              See All Features
            </a>
          </motion.div>
        </div>
      </section>

      {/* Research modules */}
      {modules.map((mod, idx) => (
        <section key={mod.title} className={`py-20 ${idx % 2 === 1 ? "bg-[#FAFBFF]" : "bg-white"}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className={`grid lg:grid-cols-2 gap-16 items-center ${mod.reverse ? "lg:grid-flow-col-dense" : ""}`}>

              <motion.div {...fade(0)} className={mod.reverse ? "lg:col-start-2" : ""}>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold mb-5"
                  style={{ background: mod.tagBg, color: mod.tagColor, border: `1px solid ${mod.tagBorder}` }}>
                  {mod.tag}
                </span>
                <h2 className="text-2xl sm:text-[2rem] font-bold text-[#111827] tracking-tight leading-tight mb-4">
                  {mod.title}
                </h2>
                <p className="text-[15px] text-[#6B7280] leading-relaxed mb-5">{mod.headline}</p>
                <ul className="space-y-2.5 mb-6">
                  {mod.bullets.map(b => (
                    <li key={b} className="flex items-start gap-3 text-[14px] text-[#374151]">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="mt-0.5 flex-shrink-0">
                        <circle cx="7" cy="7" r="6.5" stroke={mod.tagBorder} />
                        <path d="M4 7l2 2 4-4" stroke={mod.tagColor} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      {b}
                    </li>
                  ))}
                </ul>
                <a href="/request-access"
                  className="inline-flex items-center gap-1.5 text-[13.5px] font-semibold hover:gap-2.5 transition-all"
                  style={{ color: mod.tagColor }}>
                  Get access
                  <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                    <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
              </motion.div>

              <motion.div {...fade(0.12)} className={mod.reverse ? "lg:col-start-1" : ""}>
                {mod.preview}
              </motion.div>

            </div>
          </div>
        </section>
      ))}

      {/* Latest Insights */}
      <section className="py-20 bg-white border-t border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div className="mb-10" {...fade(0)}>
            <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-[#7C3AED] mb-2">From the platform</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#111827] tracking-tight">Latest research insights</h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {articles.map((a, i) => (
              <motion.div key={a.title}
                className="p-5 rounded-2xl group cursor-pointer hover:shadow-md transition-shadow duration-300"
                style={{ background: "#F8FAFC", border: "1px solid #E5E7EB" }}
                {...fade(i * 0.08)}>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                    style={{ background: "#F5F3FF", color: "#7C3AED" }}>{a.tag}</span>
                  <span className="text-[10px] text-[#9CA3AF]">{a.date}</span>
                </div>
                <h3 className="text-[14px] font-semibold text-[#111827] leading-snug mb-3 group-hover:text-[#7C3AED] transition-colors">
                  {a.title}
                </h3>
                <p className="text-[11px] text-[#9CA3AF]">{a.time}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Gated nudge */}
      <section className="py-16" style={{ background: "#111827" }}>
        <div className="max-w-xl mx-auto px-4 sm:px-6 text-center">
          <motion.div {...fade(0)}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6"
              style={{ background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.3)" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-[#A78BFA] animate-pulse inline-block" />
              <span className="text-[11px] font-semibold text-[#A78BFA]">Gated research — joining opens everything</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 tracking-tight">
              All of this, live, every day.<br />
              <span className="text-[#A78BFA]">Free during beta.</span>
            </h2>
            <p className="text-[14px] text-[#9CA3AF] mb-7">
              Full access to FII tracker, options chain, sector map, and derivatives dashboard.
            </p>
            <a href="/request-access"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-[14px] font-semibold text-[#111827] bg-white hover:bg-[#F5F3FF] transition-colors">
              Get Research Access — Free
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
