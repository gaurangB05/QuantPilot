"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { type Question, getRandomQuestions } from "@/lib/questions";

// ─── Category styles ──────────────────────────────────────────────────────────

const CATEGORY_STYLE: Record<Question["category"], { bg: string; text: string; label: string }> = {
  pnl:           { bg: "#fef9c3", text: "#854d0e",  label: "P&L" },
  options:       { bg: "#ede9fe", text: "#5b21b6",  label: "Options" },
  risk:          { bg: "#fee2e2", text: "#991b1b",  label: "Risk" },
  institutional: { bg: "#dbeafe", text: "#1e40af",  label: "Institutional" },
  portfolio:     { bg: "#d1fae5", text: "#065f46",  label: "Portfolio" },
  journal:       { bg: "#f1f5f9", text: "#334155",  label: "Journal" },
};

// ─── Refresh icon ─────────────────────────────────────────────────────────────

function RefreshIcon({ spinning }: { spinning: boolean }) {
  return (
    <motion.svg
      width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"
      animate={spinning ? { rotate: 360 } : { rotate: 0 }}
      transition={{ duration: 0.55, ease: "easeInOut" }}
    >
      <path d="M2 8C2 4.69 4.69 2 8 2c1.77 0 3.36.76 4.48 1.97" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M14 8c0 3.31-2.69 6-6 6-1.77 0-3.36-.76-4.48-1.97" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M11.5 1.5L14 4.5L11 4.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </motion.svg>
  );
}

// ─── Single card ─────────────────────────────────────────────────────────────

function QuestionCard({ q, index }: { q: Question; index: number }) {
  const cat = CATEGORY_STYLE[q.category];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.32, delay: index * 0.07 }}
      className="group relative flex flex-col gap-4 rounded-2xl p-6 cursor-default transition-all duration-200"
      style={{
        background: "#ffffff",
        border: "1.5px solid #e8edf2",
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
      }}
      whileHover={{ y: -3, boxShadow: "0 12px 32px rgba(0,0,0,0.09)", borderColor: "rgba(37,99,235,0.25)" }}
    >
      {/* Top row — icon + category */}
      <div className="flex items-start justify-between gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: "linear-gradient(135deg, rgba(37,99,235,0.1) 0%, rgba(124,58,237,0.1) 100%)" }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M3 8h10M8 3l5 5-5 5" stroke="url(#cardArrow)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            <defs>
              <linearGradient id="cardArrow" x1="3" y1="8" x2="13" y2="8" gradientUnits="userSpaceOnUse">
                <stop stopColor="#2563eb" />
                <stop offset="1" stopColor="#7c3aed" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        <span
          className="text-[11px] font-semibold px-3 py-1 rounded-full shrink-0"
          style={{ background: cat.bg, color: cat.text }}
        >
          {cat.label}
        </span>
      </div>

      {/* Question text */}
      <p className="text-[15px] leading-relaxed text-slate-700 font-medium flex-1">
        {q.text}
      </p>

      {/* Bottom — subtle arrow */}
      <div className="flex items-center gap-1.5 text-blue-500 text-[12px] font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <span>Ask TradeOS AI</span>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <path d="M2 6h8M7 3l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </motion.div>
  );
}

// ─── Main section ─────────────────────────────────────────────────────────────

export default function DemoSection() {
  const [cards, setCards] = useState<Question[]>([]);
  const [seenIds, setSeenIds] = useState<string[]>([]);
  const [spinning, setSpinning] = useState(false);

  const loadCards = useCallback((exclude: string[]) => {
    const next = getRandomQuestions(3, exclude);
    setCards(next);
    const ids = next.map((q) => q.id);
    setSeenIds((prev) => [...new Set([...prev, ...ids])]);
  }, []);

  useEffect(() => { loadCards([]); }, [loadCards]);

  const handleRefresh = () => {
    setSpinning(true);
    setTimeout(() => setSpinning(false), 600);
    loadCards(seenIds);
  };

  return (
    <section className="w-full relative overflow-hidden py-20">

      {/* Background */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div style={{ background: "linear-gradient(180deg, #ffffff 0%, #f0f4ff 40%, #f5f0ff 100%)", position: "absolute", inset: 0 }} />
        <div style={{
          backgroundImage: "radial-gradient(circle, rgba(0,0,0,0.055) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          opacity: 0.5,
          position: "absolute",
          inset: 0,
        }} />
        <div style={{
          background: "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(37,99,235,0.08) 0%, transparent 70%)",
          position: "absolute",
          inset: 0,
        }} />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6">

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          className="text-center mb-12"
        >
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-5"
            style={{ background: "rgba(37,99,235,0.07)", border: "1px solid rgba(37,99,235,0.18)" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse inline-block" />
            <span className="text-[11px] font-semibold tracking-[0.1em] uppercase text-blue-700">
              Live Demo
            </span>
          </div>

          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4 leading-[1.1]">
            <span className="text-slate-900">You may check </span>
            <span className="bg-gradient-to-r from-blue-600 via-violet-500 to-purple-600 bg-clip-text text-transparent">
              demo questions
            </span>
          </h2>

          <p className="text-slate-500 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
            These are real questions traders ask TradeOS AI to build their personalised dashboards instantly.
          </p>
        </motion.div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence mode="wait">
            {cards.map((q, i) => (
              <QuestionCard key={q.id} q={q} index={i} />
            ))}
          </AnimatePresence>
        </div>

        {/* Refresh + footer */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="flex flex-col items-center gap-3 mt-10"
        >
          <button
            onClick={handleRefresh}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-blue-600 border border-blue-200 bg-white hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
            style={{ boxShadow: "0 2px 8px rgba(37,99,235,0.08)" }}
          >
            <RefreshIcon spinning={spinning} />
            See other questions
          </button>
          <p className="text-[11px] text-slate-400">
            15 questions in the demo pool · refreshes every visit
          </p>
        </motion.div>
      </div>
    </section>
  );
}
