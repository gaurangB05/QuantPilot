"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence, useInView, useMotionValue, useTransform, useSpring } from "framer-motion";
import { type Question, getRandomQuestions } from "@/lib/questions";
import { DynamicDashboard, BuildingAnimation, type DashboardId } from "./DynamicDashboard";

const CATEGORY_STYLE: Record<Question["category"], { bg: string; text: string; label: string }> = {
  pnl:           { bg: "#FEF9C3", text: "#854D0E", label: "P&L" },
  options:       { bg: "#EDE9FE", text: "#5B21B6", label: "Options" },
  risk:          { bg: "#FEE2E2", text: "#991B1B", label: "Risk" },
  institutional: { bg: "#DBEAFE", text: "#1E40AF", label: "Institutional" },
  portfolio:     { bg: "#D1FAE5", text: "#065F46", label: "Portfolio" },
  journal:       { bg: "#F1F5F9", text: "#334155", label: "Journal" },
};

const CATEGORY_TO_DASHBOARD: Record<Question["category"], DashboardId> = {
  institutional: "fii-flows",
  options:       "options-greeks",
  risk:          "stress-test",
  pnl:           "stress-test",
  portfolio:     "options-greeks",
  journal:       "fii-flows",
};

const DASHBOARD_META: Record<DashboardId, { summary: string; insights: string[] }> = {
  "fii-flows": {
    summary: "Institutional flow analysis across cash and F&O segments for the last 60 days",
    insights: [
      "DII buying has consistently absorbed FII outflows, stabilising the market",
      "FII net position turned positive in Week 5 — a potential trend reversal signal",
      "Cash segment diverging from F&O flows — worth monitoring for direction clarity",
    ],
  },
  "options-greeks": {
    summary: "Live options position scanner with real-time Greeks and P&L breakdown",
    insights: [
      "Net delta of +0.87 means your book profits ₹870 per 1-point Nifty move",
      "Theta decay of -₹420/day is being partially offset by positive vega",
      "NIFTY 23200 CE is your largest contributor at +₹18,620 today",
    ],
  },
  "stress-test": {
    summary: "Portfolio stress simulation across six Nifty price scenarios",
    insights: [
      "Break-even sits at Nifty ~23,415 — about 85 points below current levels",
      "A -300 point move triggers -₹47,600 total loss — 3.3% of portfolio value",
      "BNKNIFTY CE short acts as a partial hedge, offsetting ~17% of the downside",
    ],
  },
};

// ─── Full-screen overlay ───────────────────────────────────────────────────────

function DemoOverlay({
  question,
  dashboardId,
  onClose,
}: {
  question: Question;
  dashboardId: DashboardId;
  onClose: () => void;
}) {
  const [phase, setPhase] = useState<"building" | "done">("building");
  const meta = DASHBOARD_META[dashboardId];

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  useEffect(() => {
    const handle = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [onClose]);

  useEffect(() => {
    const t = setTimeout(() => setPhase("done"), 3600);
    return () => clearTimeout(t);
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-[200] bg-white overflow-y-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
    >
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md border-b border-[#E5E7EB] px-5 sm:px-8 py-3.5 flex items-center justify-between">
        <button
          onClick={onClose}
          className="flex items-center gap-2 text-[13px] font-medium text-[#6B7280] hover:text-[#111827] transition-colors cursor-pointer"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 13L5 8l5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back to questions
        </button>

        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background: "#2563EB" }}>
            <svg width="10" height="10" viewBox="0 0 14 14" fill="none">
              <path d="M7 1L8.8 5.4H13.6L9.8 8L11.4 12.5L7 9.8L2.6 12.5L4.2 8L0.4 5.4H5.2L7 1Z" fill="white" />
            </svg>
          </div>
          <span className="text-[13px] font-semibold text-[#111827]">QuantPilot AI</span>
        </div>

        <AnimatePresence>
          {phase === "done" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-1.5 text-[11.5px] font-semibold text-[#22C55E]"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 6l3 3 5-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Dashboard Ready
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {phase === "building" ? (
          <motion.div
            key="building"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            className="flex flex-col items-center justify-center min-h-[calc(100vh-57px)] px-4 py-12"
          >
            <div className="mb-8 text-center max-w-lg">
              <p className="text-[10.5px] font-semibold uppercase tracking-[0.1em] text-[#9CA3AF] mb-2.5">Your Question</p>
              <p className="text-[16px] font-medium text-[#111827] leading-relaxed">
                &ldquo;{question.text}&rdquo;
              </p>
            </div>
            <div className="w-full max-w-xl">
              <BuildingAnimation chipId={dashboardId} />
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="done"
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            className="max-w-[1200px] mx-auto px-4 sm:px-6 py-10"
          >
            <div className="grid lg:grid-cols-[320px_1fr] gap-7 xl:gap-10 items-start">

              {/* Left: context */}
              <div className="flex flex-col gap-4">

                {/* Question */}
                <motion.div
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.05 }}
                  className="rounded-2xl p-4"
                  style={{ background: "#F8FAFC", border: "1px solid #E5E7EB" }}
                >
                  <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF] mb-2">Question Asked</p>
                  <p className="text-[13.5px] text-[#111827] leading-relaxed font-medium">
                    &ldquo;{question.text}&rdquo;
                  </p>
                </motion.div>

                {/* Dashboard summary */}
                <motion.div
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.12 }}
                  className="rounded-2xl p-4"
                  style={{ background: "#F8FAFC", border: "1px solid #E5E7EB" }}
                >
                  <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF] mb-2">Dashboard Built</p>
                  <p className="text-[13px] text-[#374151] leading-relaxed">{meta.summary}</p>
                </motion.div>

                {/* AI Insights */}
                <motion.div
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                  className="rounded-2xl p-4"
                  style={{ background: "#EFF6FF", border: "1px solid #BFDBFE" }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-4 h-4 rounded-md flex items-center justify-center" style={{ background: "#2563EB" }}>
                      <svg width="8" height="8" viewBox="0 0 14 14" fill="none">
                        <path d="M7 1L8.8 5.4H13.6L9.8 8L11.4 12.5L7 9.8L2.6 12.5L4.2 8L0.4 5.4H5.2L7 1Z" fill="white" />
                      </svg>
                    </div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#2563EB]">AI Insights</p>
                  </div>
                  <ul className="space-y-2.5">
                    {meta.insights.map((insight, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.35, delay: 0.28 + i * 0.1 }}
                        className="flex items-start gap-2 text-[12.5px] text-[#374151] leading-relaxed"
                      >
                        <span className="text-[#2563EB] font-bold shrink-0 mt-[1px]">→</span>
                        {insight}
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>

                {/* Follow-up input */}
                <motion.div
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.38 }}
                  className="rounded-2xl overflow-hidden"
                  style={{ border: "1px solid #E5E7EB", background: "#fff" }}
                >
                  <div className="flex items-center gap-2 px-3.5 py-3">
                    <input
                      type="text"
                      placeholder="Ask a follow-up question..."
                      className="flex-1 text-[13px] text-[#111827] placeholder:text-[#9CA3AF] outline-none bg-transparent"
                    />
                    <button
                      className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 cursor-pointer"
                      style={{ background: "#2563EB" }}
                    >
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6h8M6.5 2.5l3.5 3.5-3.5 3.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </div>
                </motion.div>

              </div>

              {/* Right: dashboard */}
              <motion.div
                initial={{ opacity: 0, scale: 0.97, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.1, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              >
                <DynamicDashboard id={dashboardId} question={question.text} />
              </motion.div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── 3D tilt card ─────────────────────────────────────────────────────────────

function TiltCard({ q, index, inView, onClick }: { q: Question; index: number; inView: boolean; onClick: () => void }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const cat = CATEGORY_STYLE[q.category];

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotateX = useSpring(useTransform(my, [-0.5, 0.5], [5, -5]), { stiffness: 280, damping: 28 });
  const rotateY = useSpring(useTransform(mx, [-0.5, 0.5], [-5, 5]), { stiffness: 280, damping: 28 });
  const glareX = useTransform(mx, [-0.5, 0.5], ["0%", "100%"]);
  const glareY = useTransform(my, [-0.5, 0.5], ["0%", "100%"]);

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    mx.set((e.clientX - rect.left) / rect.width - 0.5);
    my.set((e.clientY - rect.top) / rect.height - 0.5);
  };
  const handleLeave = () => { mx.set(0); my.set(0); };

  return (
    <motion.div
      initial={{ opacity: 0, y: 48, scale: 0.94 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.7, delay: 0.45 + index * 0.12, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
      style={{ perspective: 1000 }}
    >
      <motion.div
        ref={cardRef}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        onClick={onClick}
        style={{
          rotateX, rotateY, transformStyle: "preserve-3d",
          background: "#F8FAFC",
          border: "1px solid #E5E7EB",
          boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
        }}
        whileHover={{ background: "#ffffff", borderColor: "#2563EB", boxShadow: "0 8px 32px rgba(37,99,235,0.1)" }}
        whileTap={{ scale: 0.98 }}
        className="group relative flex flex-col gap-4 rounded-2xl p-6 h-full cursor-pointer"
      >
        {/* Glare */}
        <motion.div className="absolute inset-0 rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: useTransform([glareX, glareY],
              ([gx, gy]) => `radial-gradient(circle at ${gx} ${gy}, rgba(255,255,255,0.5) 0%, transparent 55%)`
            ),
          }}
        />

        {/* Icon + category */}
        <div className="flex items-start justify-between gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-[#EFF6FF]">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M8 3l5 5-5 5" stroke="#2563EB" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="text-[10.5px] font-semibold px-2.5 py-1 rounded-full shrink-0"
            style={{ background: cat.bg, color: cat.text }}>
            {cat.label}
          </span>
        </div>

        <p className="text-[15px] leading-relaxed text-[#374151] font-medium flex-1">{q.text}</p>

        <div className="flex items-center gap-1.5 text-[#2563EB] text-[12px] font-semibold opacity-0 group-hover:opacity-100 translate-x-[-4px] group-hover:translate-x-0 transition-all duration-200">
          <span>See Dashboard</span>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 6h8M7 3l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Refresh icon ─────────────────────────────────────────────────────────────

function RefreshIcon({ spinning }: { spinning: boolean }) {
  return (
    <motion.svg width="14" height="14" viewBox="0 0 16 16" fill="none"
      animate={spinning ? { rotate: 360 } : { rotate: 0 }}
      transition={{ duration: 0.55, ease: "easeInOut" }}>
      <path d="M2 8C2 4.69 4.69 2 8 2c1.77 0 3.36.76 4.48 1.97" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M14 8c0 3.31-2.69 6-6 6-1.77 0-3.36-.76-4.48-1.97" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M11.5 1.5L14 4.5L11 4.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </motion.svg>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function DemoSection() {
  const [cards, setCards] = useState<Question[]>([]);
  const [seenIds, setSeenIds] = useState<string[]>([]);
  const [spinning, setSpinning] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [overlayData, setOverlayData] = useState<{ question: Question; dashboardId: DashboardId } | null>(null);

  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: "-80px" });

  const loadCards = useCallback((exclude: string[]) => {
    const next = getRandomQuestions(3, exclude);
    setCards(next);
    setSeenIds((prev) => [...new Set([...prev, ...next.map((q) => q.id)])]);
  }, []);

  useEffect(() => { loadCards([]); }, [loadCards]);

  const handleRefresh = () => {
    setSpinning(true);
    setTimeout(() => setSpinning(false), 600);
    setRefreshKey((k) => k + 1);
    loadCards(seenIds);
  };

  return (
    <>
      <motion.section
        ref={sectionRef}
        className="w-full relative overflow-hidden py-24 bg-[#F8FAFC]"
        initial={{ clipPath: "inset(6% 5% 6% 5% round 32px)", opacity: 0, y: 40 }}
        whileInView={{ clipPath: "inset(0% 0% 0% 0% round 0px)", opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
      >
        {/* Top border */}
        <div className="absolute top-0 inset-x-0 h-px bg-[#E5E7EB]" />

        {/* Shimmer sweep */}
        <motion.div
          className="absolute inset-0 pointer-events-none z-20"
          initial={{ x: "-100%", opacity: 0.5 }}
          animate={inView ? { x: "200%", opacity: 0 } : {}}
          transition={{ duration: 1.0, delay: 0.5, ease: "easeInOut" }}
          style={{ background: "linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.7) 50%, transparent 70%)" }}
        />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6">

          {/* Heading */}
          <div className="text-center mb-12">
            <motion.span
              className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.08em] uppercase text-[#2563EB] bg-[#EFF6FF] px-3.5 py-1.5 rounded-full mb-5"
              initial={{ opacity: 0, y: 10 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.25 }}
            >
              <motion.span className="w-1.5 h-1.5 rounded-full bg-[#2563EB] inline-block"
                animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 2, repeat: Infinity }} />
              Live Demo
            </motion.span>

            <motion.h2
              className="text-4xl sm:text-5xl font-bold tracking-tight text-[#111827] mb-4 leading-[1.1]"
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.65, delay: 0.35, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            >
              You may check{" "}
              <span className="text-[#2563EB]">demo questions</span>
            </motion.h2>

            <motion.p
              className="text-[#6B7280] text-base sm:text-lg max-w-lg mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.45 }}
            >
              Click any question to see QuantPilot AI build your personalised dashboard in real time.
            </motion.p>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <AnimatePresence mode="wait">
              {cards.map((q, i) => (
                <TiltCard
                  key={`${refreshKey}-${q.id}`}
                  q={q}
                  index={i}
                  inView={inView}
                  onClick={() => setOverlayData({ question: q, dashboardId: CATEGORY_TO_DASHBOARD[q.category] })}
                />
              ))}
            </AnimatePresence>
          </div>

          {/* Refresh */}
          <motion.div className="flex justify-center mt-10"
            initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.9 }}>
            <motion.button onClick={handleRefresh}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-[#2563EB] border border-[#E5E7EB] bg-white cursor-pointer"
              whileHover={{ scale: 1.03, boxShadow: "0 4px 16px rgba(37,99,235,0.12)" }}
              whileTap={{ scale: 0.97 }}>
              <RefreshIcon spinning={spinning} />
              See other questions
            </motion.button>
          </motion.div>

        </div>
      </motion.section>

      {/* Full-screen overlay */}
      <AnimatePresence>
        {overlayData && (
          <DemoOverlay
            question={overlayData.question}
            dashboardId={overlayData.dashboardId}
            onClose={() => setOverlayData(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
