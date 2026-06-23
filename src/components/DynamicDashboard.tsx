"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export type DashboardId = "fii-flows" | "options-greeks" | "stress-test";

const card: React.CSSProperties = {
  background: "#F8FAFC",
  border: "1px solid #E5E7EB",
  borderRadius: "10px",
};

// ─── Shared Chrome ────────────────────────────────────────────────────────────

function DashboardChrome({
  question,
  status = "live",
  children,
}: {
  question?: string;
  status?: "live" | "building";
  children: React.ReactNode;
}) {
  return (
    <div className="w-full max-w-[600px] select-none">
      {/* AI prompt banner */}
      {question && (
        <div className="mb-3 px-3 py-2.5 rounded-xl flex items-center gap-2.5"
          style={{ background: "#EFF6FF", border: "1px solid #BFDBFE" }}>
          <div className="w-5 h-5 rounded-md flex items-center justify-center shrink-0"
            style={{ background: "#2563EB" }}>
            <svg width="10" height="10" viewBox="0 0 14 14" fill="none">
              <path d="M7 1L8.8 5.4H13.6L9.8 8L11.4 12.5L7 9.8L2.6 12.5L4.2 8L0.4 5.4H5.2L7 1Z" fill="white" />
            </svg>
          </div>
          <p className="text-[11px] text-[#374151] truncate flex-1 italic">&ldquo;{question}&rdquo;</p>
          <div className="flex items-center gap-1 shrink-0">
            <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
              <path d="M1.5 4.5l2 2L7.5 2" stroke="#22C55E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-[10px] font-semibold text-[#22C55E]">Dashboard Built</span>
          </div>
        </div>
      )}

      <div className="rounded-2xl overflow-hidden" style={{
        background: "#ffffff",
        border: "1px solid #E5E7EB",
        boxShadow: "0 20px 60px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.04)",
      }}>
        {/* Title bar */}
        <div className="flex items-center gap-2 px-4 py-3 bg-[#F8FAFC] border-b border-[#E5E7EB]">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#FCA5A5]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#FCD34D]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#6EE7B7]" />
          </div>
          <div className="flex-1 mx-3">
            <div className="bg-white border border-[#E5E7EB] rounded-md px-3 py-1 text-center">
              <span className="text-[10px] text-[#9CA3AF]">app.quantpilot.io/workspace</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {status === "building" ? (
              <>
                <motion.div
                  className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]"
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 0.7, repeat: Infinity }}
                />
                <span className="text-[9px] text-[#6B7280] font-medium">Building</span>
              </>
            ) : (
              <>
                <div className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
                <span className="text-[9px] text-[#6B7280] font-medium">Live</span>
              </>
            )}
          </div>
        </div>
        <div className="p-3 bg-white">{children}</div>
      </div>
    </div>
  );
}

// ─── Sparkline ────────────────────────────────────────────────────────────────

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const W = 200, H = 50;
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * W;
    const y = H - ((v - min) / range) * (H - 4) - 2;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const line = `M ${pts.join(" L ")}`;
  const area = `${line} L ${W},${H} L 0,${H} Z`;
  const gid = `sg${color.replace(/[^a-z0-9]/gi, "")}`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.15" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gid})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Building Animation ───────────────────────────────────────────────────────

const BUILD_STEPS: Record<DashboardId, string[]> = {
  "fii-flows":      ["Parsing your question", "Fetching FII/DII data",  "Drawing flow charts",  "Finalising workspace"],
  "options-greeks": ["Parsing your question", "Loading positions data", "Computing Greeks",     "Finalising workspace"],
  "stress-test":    ["Parsing your question", "Loading portfolio data", "Running stress tests", "Finalising workspace"],
};

export function BuildingAnimation({ chipId }: { chipId: DashboardId }) {
  const [activeStep, setActiveStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const steps = BUILD_STEPS[chipId];

  useEffect(() => {
    const t1 = setTimeout(() => setActiveStep(1), 700);
    const t2 = setTimeout(() => setActiveStep(2), 1500);
    const t3 = setTimeout(() => setActiveStep(3), 2300);
    const t4 = setTimeout(() => setActiveStep(4), 3000);

    let p = 0;
    const iv = setInterval(() => {
      p += 1.5;
      setProgress(Math.min(Math.round(p), 100));
      if (p >= 100) clearInterval(iv);
    }, 50);

    return () => {
      [t1, t2, t3, t4].forEach(clearTimeout);
      clearInterval(iv);
    };
  }, []);

  return (
    <DashboardChrome status="building">
      {/* AI status header */}
      <div className="flex items-start gap-4 mb-5 p-1">
        {/* Pulsing icon */}
        <div className="relative shrink-0 mt-0.5">
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{ background: "rgba(37,99,235,0.12)" }}
            animate={{ scale: [1, 1.5, 1], opacity: [0.7, 0, 0.7] }}
            transition={{ duration: 1.6, repeat: Infinity }}
          />
          <div className="relative w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: "#EFF6FF", border: "2px solid #BFDBFE" }}>
            <motion.svg
              width="16" height="16" viewBox="0 0 14 14" fill="none"
              animate={{ rotate: [0, 12, -12, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <path d="M7 1L8.8 5.4H13.6L9.8 8L11.4 12.5L7 9.8L2.6 12.5L4.2 8L0.4 5.4H5.2L7 1Z" fill="#2563EB" />
            </motion.svg>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold text-[#111827] leading-tight mb-0.5">Building your workspace</p>
          <p className="text-[11px] text-[#9CA3AF] mb-3">QuantPilot AI is generating your dashboard</p>

          {/* Progress bar */}
          <div className="h-1.5 rounded-full overflow-hidden mb-1" style={{ background: "#F3F4F6" }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: "linear-gradient(90deg, #2563EB, #60A5FA)" }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.12, ease: "linear" }}
            />
          </div>
          <p className="text-[10px] text-[#9CA3AF]">{progress}% complete</p>
        </div>
      </div>

      {/* Step checklist */}
      <div className="space-y-2.5 mb-5 px-1">
        {steps.map((s, i) => {
          const done = activeStep > i;
          const active = activeStep === i;
          return (
            <motion.div
              key={s}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: i <= activeStep ? 1 : 0.3, x: 0 }}
              transition={{ duration: 0.3, delay: i * 0.08 }}
              className="flex items-center gap-2.5"
            >
              {done ? (
                <div className="w-4 h-4 rounded-full bg-[#22C55E] flex items-center justify-center shrink-0">
                  <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                    <path d="M1.5 4l2 2L6.5 1.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              ) : active ? (
                <div className="w-4 h-4 rounded-full border-2 border-[#2563EB] flex items-center justify-center shrink-0">
                  <motion.div
                    className="w-1.5 h-1.5 rounded-full bg-[#2563EB]"
                    animate={{ scale: [1, 0.4, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                  />
                </div>
              ) : (
                <div className="w-4 h-4 rounded-full border-2 border-[#E5E7EB] shrink-0" />
              )}
              <span className={`text-[12px] flex-1 ${done ? "text-[#374151] font-medium" : active ? "text-[#111827] font-semibold" : "text-[#9CA3AF]"}`}>
                {s}
              </span>
              {done && (
                <motion.span
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="text-[10px] font-semibold text-[#22C55E]"
                >
                  Done
                </motion.span>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Skeleton dashboard building up */}
      <div className="space-y-2">
        <AnimatePresence>
          {activeStep >= 1 && (
            <motion.div key="sk-stats"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-4 gap-2"
            >
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-14 rounded-xl animate-pulse" style={{ background: "#ECEEF0" }} />
              ))}
            </motion.div>
          )}
          {activeStep >= 2 && (
            <motion.div key="sk-chart"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-5 gap-2"
            >
              <div className="col-span-3 h-20 rounded-xl animate-pulse" style={{ background: "#ECEEF0" }} />
              <div className="col-span-2 flex flex-col gap-2">
                <div className="h-9 rounded-xl animate-pulse" style={{ background: "#ECEEF0" }} />
                <div className="flex-1 rounded-xl animate-pulse" style={{ background: "#ECEEF0" }} />
              </div>
            </motion.div>
          )}
          {activeStep >= 3 && (
            <motion.div key="sk-bottom"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-5 gap-2"
            >
              <div className="col-span-2 h-14 rounded-xl animate-pulse" style={{ background: "#ECEEF0" }} />
              <div className="col-span-2 h-14 rounded-xl animate-pulse" style={{ background: "#ECEEF0" }} />
              <div className="col-span-1 h-14 rounded-xl animate-pulse" style={{ background: "#ECEEF0" }} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardChrome>
  );
}

// ─── FII / DII Flows Dashboard ────────────────────────────────────────────────

const FII_WEEKS = [
  { w: "W1", fii: -24, dii: 18 },
  { w: "W2", fii:  12, dii:  9 },
  { w: "W3", fii: -31, dii: 24 },
  { w: "W4", fii:  28, dii:  6 },
  { w: "W5", fii:  42, dii: -4 },
  { w: "W6", fii: -16, dii: 19 },
  { w: "W7", fii:  35, dii: 12 },
  { w: "W8", fii:  21, dii:  8 },
];

function FIIDashboard({ question }: { question?: string }) {
  const MAXABS = 50, ZEROLINE = 36, MAXBARH = 30, BARW = 11, GAPIN = 3, GROUPW = 34;
  return (
    <DashboardChrome question={question}>
      <div className="grid grid-cols-3 gap-2 mb-2.5">
        {[
          { label: "FII Net (60D)", value: "+₹8,700 Cr",   color: "#2563EB" },
          { label: "DII Net (60D)", value: "+₹15,200 Cr",  color: "#22C55E" },
          { label: "FII vs DII",   value: "DII Dominant", color: "#6B7280" },
        ].map((s) => (
          <div key={s.label} style={card} className="p-2.5">
            <p className="text-[7.5px] text-[#9CA3AF] uppercase tracking-wide font-medium mb-1">{s.label}</p>
            <p className="text-[11px] font-bold leading-none" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      <div style={card} className="p-2.5 mb-2.5">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[8px] text-[#9CA3AF] uppercase tracking-wide font-medium">Weekly Net Flows (₹00 Cr)</p>
          <div className="flex items-center gap-3">
            {[["#2563EB", "FII"], ["#22C55E", "DII"]].map(([c, l]) => (
              <div key={l} className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-sm" style={{ background: c }} />
                <span className="text-[7.5px] text-[#6B7280]">{l}</span>
              </div>
            ))}
          </div>
        </div>
        <svg viewBox={`0 0 ${FII_WEEKS.length * GROUPW + 8} ${ZEROLINE + MAXBARH + 16}`}
          className="w-full" style={{ height: "68px" }}>
          <line x1="0" y1={ZEROLINE} x2={FII_WEEKS.length * GROUPW + 8} y2={ZEROLINE}
            stroke="#E5E7EB" strokeWidth="0.5" />
          {FII_WEEKS.map((d, i) => {
            const gx = i * GROUPW + 4;
            const fiiH = (Math.abs(d.fii) / MAXABS) * MAXBARH;
            const diiH = (Math.abs(d.dii) / MAXABS) * MAXBARH;
            return (
              <g key={d.w}>
                <rect x={gx} width={BARW} y={d.fii >= 0 ? ZEROLINE - fiiH : ZEROLINE} height={fiiH} rx="2"
                  fill={d.fii >= 0 ? "#2563EB" : "#BFDBFE"} />
                <rect x={gx + BARW + GAPIN} width={BARW} y={d.dii >= 0 ? ZEROLINE - diiH : ZEROLINE} height={diiH} rx="2"
                  fill={d.dii >= 0 ? "#22C55E" : "#BBF7D0"} />
                <text x={gx + BARW} y={ZEROLINE + MAXBARH + 11} textAnchor="middle" fill="#9CA3AF" fontSize="6">{d.w}</text>
              </g>
            );
          })}
        </svg>
      </div>

      <div style={card} className="p-2.5">
        <p className="text-[8px] text-[#9CA3AF] uppercase tracking-wide font-medium mb-2">Today&apos;s Activity</p>
        <div className="space-y-1.5">
          {[
            { type: "FII", action: "Cash Segment", val: "-₹1,240 Cr", pos: false },
            { type: "FII", action: "F&O Net Long", val: "+₹3,180 Cr", pos: true  },
            { type: "DII", action: "Cash Buy",     val: "+₹2,460 Cr", pos: true  },
          ].map((r, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[7.5px] font-bold px-1.5 py-0.5 rounded"
                  style={{ background: r.type === "FII" ? "#EFF6FF" : "#F0FDF4", color: r.type === "FII" ? "#1D4ED8" : "#15803D" }}>
                  {r.type}
                </span>
                <span className="text-[9px] text-[#374151]">{r.action}</span>
              </div>
              <span className="text-[9px] font-semibold" style={{ color: r.pos ? "#16A34A" : "#DC2626" }}>{r.val}</span>
            </div>
          ))}
        </div>
      </div>
    </DashboardChrome>
  );
}

// ─── Options Greeks Dashboard ─────────────────────────────────────────────────

const POSITIONS = [
  { sym: "NIFTY",    strike: "23500 CE", qty: "+5L", delta: "+0.42", theta: "-8.2",  pnl: "+₹12,340", pos: true  },
  { sym: "NIFTY",    strike: "23500 PE", qty: "-3L", delta: "+0.18", theta: "+6.1",  pnl: "+₹4,210",  pos: true  },
  { sym: "BNKNIFTY", strike: "52000 CE", qty: "-2L", delta: "-0.31", theta: "+12.4", pnl: "-₹3,180",  pos: false },
  { sym: "NIFTY",    strike: "23200 CE", qty: "+3L", delta: "+0.58", theta: "-10.8", pnl: "+₹18,620", pos: true  },
];

function GreeksDashboard({ question }: { question?: string }) {
  return (
    <DashboardChrome question={question}>
      <div className="grid grid-cols-4 gap-2 mb-2.5">
        {[
          { label: "Net Delta",  value: "+0.87",    color: "#2563EB" },
          { label: "Theta/Day",  value: "-₹420",    color: "#EF4444" },
          { label: "Net Vega",   value: "+12.4",    color: "#6B7280" },
          { label: "Today P&L",  value: "+₹31,990", color: "#22C55E" },
        ].map((s) => (
          <div key={s.label} style={card} className="p-2 text-center">
            <p className="text-[7px] text-[#9CA3AF] uppercase tracking-wide font-medium mb-1">{s.label}</p>
            <p className="text-[10.5px] font-bold leading-none" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      <div style={{ ...card, padding: 0, overflow: "hidden" }}>
        <div className="grid px-3 py-2 bg-[#F8FAFC]"
          style={{ gridTemplateColumns: "2fr 0.6fr 0.6fr 0.6fr 0.8fr" }}>
          {["Position", "Qty", "Delta", "Theta", "P&L"].map((h) => (
            <span key={h} className="text-[7px] font-semibold text-[#9CA3AF] uppercase tracking-wide">{h}</span>
          ))}
        </div>
        {POSITIONS.map((p, i) => (
          <div key={i} className="grid px-3 py-2.5 border-t border-[#F5F5F5]"
            style={{ gridTemplateColumns: "2fr 0.6fr 0.6fr 0.6fr 0.8fr", background: i % 2 === 0 ? "#fff" : "#FAFAFA" }}>
            <div>
              <p className="text-[8.5px] font-semibold text-[#111827] leading-none">{p.sym}</p>
              <p className="text-[7.5px] text-[#6B7280] mt-0.5">{p.strike}</p>
            </div>
            <span className="text-[8px] font-medium self-center" style={{ color: p.qty.startsWith("+") ? "#2563EB" : "#6B7280" }}>{p.qty}</span>
            <span className="text-[8px] text-[#374151] self-center">{p.delta}</span>
            <span className="text-[8px] self-center" style={{ color: p.theta.startsWith("-") ? "#EF4444" : "#22C55E" }}>{p.theta}</span>
            <span className="text-[8px] font-semibold self-center" style={{ color: p.pos ? "#16A34A" : "#DC2626" }}>{p.pnl}</span>
          </div>
        ))}
        <div className="grid px-3 py-2 border-t border-[#E5E7EB] bg-[#F8FAFC]"
          style={{ gridTemplateColumns: "2fr 0.6fr 0.6fr 0.6fr 0.8fr" }}>
          <span className="text-[8px] font-bold text-[#111827]">Net Exposure</span>
          <span className="text-[8px] text-[#9CA3AF]">—</span>
          <span className="text-[8px] font-bold text-[#2563EB]">+0.87</span>
          <span className="text-[8px] font-bold text-[#EF4444]">-420/d</span>
          <span className="text-[8px] font-bold text-[#16A34A]">+₹31,990</span>
        </div>
      </div>

      <div style={card} className="p-2.5 mt-2">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[8px] text-[#9CA3AF] uppercase tracking-wide font-medium">Delta Distribution</p>
          <span className="text-[8px] font-semibold text-[#2563EB]">Net Long</span>
        </div>
        <div className="flex gap-4">
          {[{ label: "NIFTY", pct: 65, color: "#2563EB" }, { label: "BNKNIFTY", pct: 35, color: "#60A5FA" }].map((b) => (
            <div key={b.label} className="flex-1">
              <div className="flex justify-between mb-0.5">
                <span className="text-[7.5px] text-[#374151]">{b.label}</span>
                <span className="text-[7.5px] text-[#6B7280]">{b.pct}%</span>
              </div>
              <div className="h-[3px] rounded-full" style={{ background: "#F3F4F6" }}>
                <div className="h-full rounded-full" style={{ width: `${b.pct}%`, background: b.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardChrome>
  );
}

// ─── Stress Test Dashboard ────────────────────────────────────────────────────

const SCENARIOS = [
  { label: "+200", pnl:  42000 },
  { label: "+100", pnl:  24500 },
  { label: "Now",  pnl:  14200 },
  { label: "-100", pnl:  -3800 },
  { label: "-200", pnl: -24100 },
  { label: "-300", pnl: -47600 },
];

function StressTestDashboard({ question }: { question?: string }) {
  return (
    <DashboardChrome question={question}>
      <div className="grid grid-cols-3 gap-2 mb-2.5">
        {[
          { label: "Current P&L",   value: "+₹14,200", color: "#22C55E" },
          { label: "At Nifty -300", value: "-₹47,600", color: "#EF4444" },
          { label: "Break-even",    value: "~23,415",  color: "#6B7280" },
        ].map((s) => (
          <div key={s.label} style={card} className="p-2.5">
            <p className="text-[7.5px] text-[#9CA3AF] uppercase tracking-wide font-medium mb-1">{s.label}</p>
            <p className="text-[12px] font-bold leading-none" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      <div style={card} className="p-2.5 mb-2">
        <p className="text-[8px] text-[#9CA3AF] uppercase tracking-wide font-medium mb-2">Portfolio P&L vs Nifty Move</p>
        <div className="h-[54px]">
          <Sparkline data={SCENARIOS.map((s) => s.pnl)} color="#2563EB" />
        </div>
        <div className="flex justify-between mt-2">
          {SCENARIOS.map((s) => (
            <div key={s.label} className="text-center flex-1">
              <div className="text-[7px] font-medium leading-none" style={{ color: s.pnl >= 0 ? "#22C55E" : "#EF4444" }}>
                {s.pnl >= 0 ? "+" : ""}₹{(Math.abs(s.pnl) / 1000).toFixed(0)}K
              </div>
              <div className="text-[6.5px] text-[#9CA3AF] mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={card} className="p-2.5">
        <p className="text-[8px] text-[#9CA3AF] uppercase tracking-wide font-medium mb-2">Position Impact at -300 pts</p>
        <div className="space-y-2">
          {[
            { name: "NIFTY CE Longs",    impact: "-₹28,400", pct: 60, pos: false },
            { name: "NIFTY PE Shorts",   impact: "-₹12,300", pct: 26, pos: false },
            { name: "BNKNIFTY CE Short", impact: "+₹8,100",  pct: 17, pos: true  },
          ].map((r, i) => (
            <div key={i}>
              <div className="flex justify-between mb-0.5">
                <span className="text-[8.5px] text-[#374151]">{r.name}</span>
                <span className="text-[8.5px] font-semibold" style={{ color: r.pos ? "#22C55E" : "#EF4444" }}>{r.impact}</span>
              </div>
              <div className="h-[3px] rounded-full" style={{ background: "#F3F4F6" }}>
                <div className="h-full rounded-full" style={{ width: `${r.pct}%`, background: r.pos ? "#22C55E" : "#EF4444" }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardChrome>
  );
}

// ─── Export ───────────────────────────────────────────────────────────────────

export function DynamicDashboard({ id, question }: { id: DashboardId; question?: string }) {
  if (id === "fii-flows")      return <FIIDashboard question={question} />;
  if (id === "options-greeks") return <GreeksDashboard question={question} />;
  if (id === "stress-test")    return <StressTestDashboard question={question} />;
  return null;
}
