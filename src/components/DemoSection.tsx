"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence, useInView, useMotionValue, useTransform, useSpring } from "framer-motion";
import { type Question, getRandomQuestions } from "@/lib/questions";

const CATEGORY_STYLE: Record<Question["category"], { bg: string; text: string; label: string }> = {
  pnl:           { bg: "#FEF9C3", text: "#854D0E", label: "P&L" },
  options:       { bg: "#EDE9FE", text: "#5B21B6", label: "Options" },
  risk:          { bg: "#FEE2E2", text: "#991B1B", label: "Risk" },
  institutional: { bg: "#DBEAFE", text: "#1E40AF", label: "Institutional" },
  portfolio:     { bg: "#D1FAE5", text: "#065F46", label: "Portfolio" },
  journal:       { bg: "#F1F5F9", text: "#334155", label: "Journal" },
};

// ─── 3D tilt card ─────────────────────────────────────────────────────────────

function TiltCard({ q, index, inView }: { q: Question; index: number; inView: boolean }) {
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
        style={{
          rotateX, rotateY, transformStyle: "preserve-3d",
          background: "#F8FAFC",
          border: "1px solid #E5E7EB",
          boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
        }}
        whileHover={{ background: "#ffffff", borderColor: "#2563EB", boxShadow: "0 8px 32px rgba(37,99,235,0.1)" }}
        className="group relative flex flex-col gap-4 rounded-2xl p-6 h-full cursor-default"
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
          <span>Ask TradeOS AI</span>
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
            Real questions traders ask TradeOS AI to build their personalised dashboards.
          </motion.p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence mode="wait">
            {cards.map((q, i) => (
              <TiltCard key={`${refreshKey}-${q.id}`} q={q} index={i} inView={inView} />
            ))}
          </AnimatePresence>
        </div>

        {/* Refresh */}
        <motion.div className="flex justify-center mt-10"
          initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.9 }}>
          <motion.button onClick={handleRefresh}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-[#2563EB] border border-[#E5E7EB] bg-white"
            whileHover={{ scale: 1.03, boxShadow: "0 4px 16px rgba(37,99,235,0.12)" }}
            whileTap={{ scale: 0.97 }}>
            <RefreshIcon spinning={spinning} />
            See other questions
          </motion.button>
        </motion.div>
      </div>
    </motion.section>
  );
}
