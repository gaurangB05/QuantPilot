"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence, useInView, useMotionValue, useTransform, useSpring } from "framer-motion";
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

// ─── 3D tilt card ─────────────────────────────────────────────────────────────

function TiltCard({ q, index, inView }: { q: Question; index: number; inView: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const cat = CATEGORY_STYLE[q.category];

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [6, -6]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-6, 6]), { stiffness: 300, damping: 30 });
  const glareX = useTransform(x, [-0.5, 0.5], ["0%", "100%"]);
  const glareY = useTransform(y, [-0.5, 0.5], ["0%", "100%"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 60, scale: 0.88, rotateX: 8 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1, rotateX: 0 } : {}}
      transition={{
        duration: 0.75,
        delay: index * 0.14,
        ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
      }}
      style={{ perspective: 1000 }}
    >
      <motion.div
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="group relative flex flex-col gap-4 rounded-2xl p-6 h-full cursor-default"
        whileHover={{ boxShadow: "0 20px 48px rgba(37,99,235,0.15), 0 4px 16px rgba(0,0,0,0.08)", borderColor: "rgba(37,99,235,0.3)" }}
        transition={{ duration: 0.2 }}
        initial={false}
        animate={{
          background: "#ffffff",
          border: "1.5px solid #e8edf2",
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        }}
      >
        {/* Glare overlay */}
        <motion.div
          className="absolute inset-0 rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: useTransform(
              [glareX, glareY],
              ([gx, gy]) =>
                `radial-gradient(circle at ${gx} ${gy}, rgba(255,255,255,0.18) 0%, transparent 60%)`
            ),
          }}
        />

        {/* Top row */}
        <div className="flex items-start justify-between gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "linear-gradient(135deg, rgba(37,99,235,0.1) 0%, rgba(124,58,237,0.1) 100%)" }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M3 8h10M8 3l5 5-5 5" stroke="url(#arrow)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              <defs>
                <linearGradient id="arrow" x1="3" y1="8" x2="13" y2="8" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#2563eb" /><stop offset="1" stopColor="#7c3aed" />
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
        <p className="text-[15.5px] leading-relaxed text-slate-700 font-medium flex-1">{q.text}</p>

        {/* Bottom hover hint */}
        <motion.div
          className="flex items-center gap-1.5 text-blue-500 text-[12px] font-semibold"
          initial={{ opacity: 0, x: -4 }}
          whileHover={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.18 }}
        >
          <span>Ask TradeOS AI</span>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path d="M2 6h8M7 3l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

// ─── Floating orb ─────────────────────────────────────────────────────────────

function Orb({ style, duration, delay }: { style: React.CSSProperties; duration: number; delay: number }) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{ ...style, filter: "blur(70px)" }}
      animate={{ y: [0, -28, 0], x: [0, 14, 0], scale: [1, 1.08, 1] }}
      transition={{ duration, delay, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

// ─── Refresh icon ─────────────────────────────────────────────────────────────

function RefreshIcon({ spinning }: { spinning: boolean }) {
  return (
    <motion.svg
      width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true"
      animate={spinning ? { rotate: 360 } : { rotate: 0 }}
      transition={{ duration: 0.55, ease: "easeInOut" }}
    >
      <path d="M2 8C2 4.69 4.69 2 8 2c1.77 0 3.36.76 4.48 1.97" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M14 8c0 3.31-2.69 6-6 6-1.77 0-3.36-.76-4.48-1.97" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M11.5 1.5L14 4.5L11 4.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </motion.svg>
  );
}

// ─── Word reveal heading ───────────────────────────────────────────────────────

function RevealWords({ text, className, delay = 0 }: { text: string; className?: string; delay?: number }) {
  const words = text.split(" ");
  return (
    <span className={className}>
      {words.map((word, i) => (
        <span key={i} className="inline-block overflow-hidden mr-[0.25em] last:mr-0">
          <motion.span
            className="inline-block"
            initial={{ y: "100%", opacity: 0 }}
            whileInView={{ y: "0%", opacity: 1 }}
            viewport={{ once: true }}
            transition={{
              duration: 0.6,
              delay: delay + i * 0.06,
              ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
            }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

// ─── Main section ─────────────────────────────────────────────────────────────

export default function DemoSection() {
  const [cards, setCards] = useState<Question[]>([]);
  const [seenIds, setSeenIds] = useState<string[]>([]);
  const [spinning, setSpinning] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: "-80px" });

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
    setRefreshKey((k) => k + 1);
    loadCards(seenIds);
  };

  return (
    <section ref={sectionRef} className="w-full relative overflow-hidden py-24">

      {/* ── Animated background ── */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div style={{ background: "linear-gradient(180deg, #ffffff 0%, #eef2ff 40%, #f5f0ff 100%)", position: "absolute", inset: 0 }} />
        <div style={{ backgroundImage: "radial-gradient(circle, rgba(0,0,0,0.05) 1px, transparent 1px)", backgroundSize: "28px 28px", opacity: 0.5, position: "absolute", inset: 0 }} />
        <Orb style={{ width: 520, height: 520, top: -120, left: "10%", background: "rgba(37,99,235,0.12)" }} duration={7} delay={0} />
        <Orb style={{ width: 400, height: 400, bottom: -80, right: "8%", background: "rgba(124,58,237,0.1)" }} duration={9} delay={2} />
        <Orb style={{ width: 300, height: 300, top: "30%", left: "55%", background: "rgba(14,165,233,0.08)" }} duration={11} delay={4} />
      </div>

      {/* ── Top divider beam ── */}
      <motion.div
        className="absolute top-0 left-1/2 -translate-x-1/2 h-px"
        style={{ background: "linear-gradient(90deg, transparent, rgba(37,99,235,0.3), transparent)" }}
        initial={{ width: 0, opacity: 0 }}
        whileInView={{ width: "70%", opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1, ease: "easeOut" }}
      />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6">

        {/* ── Heading ── */}
        <div className="text-center mb-14">

          {/* Badge */}
          <motion.div
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-6"
            style={{ background: "rgba(37,99,235,0.07)", border: "1px solid rgba(37,99,235,0.18)" }}
            initial={{ opacity: 0, scale: 0.85, y: 10 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          >
            <motion.span
              className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span className="text-[11px] font-semibold tracking-[0.1em] uppercase text-blue-700">Live Demo</span>
          </motion.div>

          {/* Main heading — word-by-word reveal */}
          <h2 className="text-4xl sm:text-5xl xl:text-[3.2rem] font-bold tracking-tight mb-5 leading-[1.1]">
            <RevealWords text="You may check" className="text-slate-900" delay={0.1} />
            {" "}
            <RevealWords
              text="demo questions"
              className="bg-gradient-to-r from-blue-600 via-violet-500 to-purple-600 bg-clip-text text-transparent"
              delay={0.32}
            />
          </h2>

          {/* Subtitle */}
          <motion.p
            className="text-slate-500 text-base sm:text-lg max-w-xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.55, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          >
            These are real questions traders ask TradeOS AI to build personalised dashboards instantly.
          </motion.p>
        </div>

        {/* ── Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="wait">
            {cards.map((q, i) => (
              <TiltCard key={`${refreshKey}-${q.id}`} q={q} index={i} inView={inView} />
            ))}
          </AnimatePresence>
        </div>

        {/* ── Refresh + footer ── */}
        <motion.div
          className="flex flex-col items-center gap-3 mt-12"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <motion.button
            onClick={handleRefresh}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-blue-600 border border-blue-200 bg-white transition-colors duration-200"
            whileHover={{ scale: 1.03, boxShadow: "0 4px 20px rgba(37,99,235,0.15)", borderColor: "#93c5fd" }}
            whileTap={{ scale: 0.97 }}
          >
            <RefreshIcon spinning={spinning} />
            See other questions
          </motion.button>
          <p className="text-[11px] text-slate-400">15 questions in the demo pool · refreshes every visit</p>
        </motion.div>
      </div>
    </section>
  );
}
