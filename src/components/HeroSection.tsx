"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DashboardMockup from "./DashboardMockup";
import { DynamicDashboard, BuildingAnimation, type DashboardId } from "./DynamicDashboard";
import { FullScreenDashboard } from "./FullScreenDashboard";

// ─── Data ─────────────────────────────────────────────────────────────────────

type Chip = { id: DashboardId; label: string; question: string };

const CHIP_VARIANTS: [Chip[], Chip[], Chip[]] = [
  [
    { id: "fii-flows", label: "Nifty + FII/DII Flows",       question: "Show FII vs DII institutional flows in cash and F&O over the last 60 days" },
    { id: "fii-flows", label: "Who's buying the market?",    question: "Show which institutions are net buyers and sellers in the Indian market today" },
    { id: "fii-flows", label: "Cash vs F&O Flow Data",       question: "Compare FII and DII flows across cash equity, F&O index and F&O stock segments" },
    { id: "fii-flows", label: "FII Selling Streak",          question: "Show the top 5 days of highest FII selling in the last 3 months" },
    { id: "fii-flows", label: "DII Accumulation Trend",      question: "Show DII net buying trend over the last 30 days — are they accumulating?" },
    { id: "fii-flows", label: "FII vs Market Correlation",   question: "Has FII activity been correlated with Nifty movements this month?" },
    { id: "fii-flows", label: "Institutional Tug of War",    question: "Show me the DII vs FII tug of war with daily Nifty movement overlay" },
    { id: "fii-flows", label: "FII Consecutive Buy Days",    question: "When was the last time FII was a net buyer for 5 consecutive trading days?" },
    { id: "fii-flows", label: "Sector-wise FII Flows",       question: "Which sectors are seeing the most FII inflows and outflows this week?" },
  ],
  [
    { id: "options-greeks", label: "Live Options & Greeks",    question: "Show my live options positions with Greeks, IV and today's P&L" },
    { id: "options-greeks", label: "My Delta & Theta Today",   question: "What is my net delta, theta decay and vega exposure across all open positions?" },
    { id: "options-greeks", label: "Options Book Summary",     question: "Show a full options portfolio summary with P&L and Greeks for each position" },
    { id: "options-greeks", label: "Highest Gamma Risk",       question: "Which of my options positions has the highest gamma risk today?" },
    { id: "options-greeks", label: "Daily Theta Bleed",        question: "How much theta am I losing per day across all positions combined?" },
    { id: "options-greeks", label: "IV Percentile by Strike",  question: "Show me the IV percentile for each of my open option strikes" },
    { id: "options-greeks", label: "Flat Market P&L",          question: "What is my maximum profit if Nifty stays flat for the next 5 days?" },
    { id: "options-greeks", label: "Vega Concentration",       question: "Which position is contributing the most to my portfolio's vega exposure?" },
    { id: "options-greeks", label: "Options Expiry P&L",       question: "What is my total P&L if all positions expire at current Nifty levels?" },
  ],
  [
    { id: "stress-test", label: "Nifty -300 Stress Test",    question: "If Nifty drops 300 points, what is my total portfolio loss?" },
    { id: "stress-test", label: "Max Drawdown Scenario",     question: "What is my maximum portfolio loss if Nifty falls 500 points from current levels?" },
    { id: "stress-test", label: "Portfolio Break-even",      question: "At what Nifty level does my portfolio break even? Show all risk scenarios." },
    { id: "stress-test", label: "Bank Nifty -600 Impact",    question: "How much would I lose if Bank Nifty falls 600 points tomorrow?" },
    { id: "stress-test", label: "Full Scenario P&L Range",   question: "Show my portfolio P&L for every 100-point Nifty move from -500 to +500" },
    { id: "stress-test", label: "Volatility Spike Impact",   question: "What is my portfolio loss if volatility spikes 20% overnight?" },
    { id: "stress-test", label: "Global Crash Simulation",   question: "If global markets crash 5% overnight, how much do I lose?" },
    { id: "stress-test", label: "Best Hedge Position",       question: "Which of my positions provides the best hedge in a Nifty correction?" },
    { id: "stress-test", label: "Margin Call Threshold",     question: "At what Nifty level would I get a margin call based on my current positions?" },
  ],
];

type PanelState = "default" | "building" | "done";

// ─── Infer dashboard from question text ───────────────────────────────────────

function inferDashboard(text: string): DashboardId {
  const t = text.toLowerCase();
  if (t.match(/fii|dii|institutional|flow/)) return "fii-flows";
  if (t.match(/option|greek|delta|theta|vega|iv|implied/)) return "options-greeks";
  return "stress-test";
}

// ─── Full-screen overlay ──────────────────────────────────────────────────────

function HeroDashOverlay({ id, question, onClose }: { id: DashboardId; question: string; onClose: () => void }) {
  const [phase, setPhase] = useState<"building" | "done">("building");

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
      className="fixed inset-0 z-[200] bg-[#F8FAFC] overflow-y-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
    >
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md border-b border-[#E5E7EB] px-5 sm:px-8 py-3.5 flex items-center justify-between">
        <button onClick={onClose}
          className="flex items-center gap-2 text-[13px] font-medium text-[#6B7280] hover:text-[#111827] transition-colors cursor-pointer">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 13L5 8l5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Close
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
            <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-1.5 text-[11.5px] font-semibold text-[#22C55E]">
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
          <motion.div key="building"
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            className="flex flex-col items-center justify-center min-h-[calc(100vh-57px)] px-4 py-12"
          >
            <div className="mb-8 text-center max-w-lg">
              <p className="text-[10.5px] font-semibold uppercase tracking-[0.1em] text-[#9CA3AF] mb-2.5">Your Question</p>
              <p className="text-[16px] font-medium text-[#111827] leading-relaxed">&ldquo;{question}&rdquo;</p>
            </div>
            <div className="w-full max-w-xl">
              <BuildingAnimation chipId={id} />
            </div>
          </motion.div>
        ) : (
          <motion.div key="done"
            initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            className="max-w-[1300px] mx-auto px-4 sm:px-6 py-8"
          >
            <FullScreenDashboard id={id} question={question} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function HeroSection() {
  const [activeChip, setActiveChip] = useState<DashboardId | null>(null);
  const [panelState, setPanelState] = useState<PanelState>("default");
  const [text, setText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [chipIdx, setChipIdx] = useState<[number, number, number]>([0, 0, 0]);
  const [shuffleSpin, setShuffleSpin] = useState(false);
  const [activeQuestion, setActiveQuestion] = useState("");

  const [overlayDash, setOverlayDash] = useState<{ id: DashboardId; question: string } | null>(null);

  const typingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const buildTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const chips = CHIP_VARIANTS.map((variants, i) => variants[chipIdx[i]]) as [Chip, Chip, Chip];
  const hasText = text.trim().length > 0;

  const shuffleChips = () => {
    setShuffleSpin(true);
    setTimeout(() => setShuffleSpin(false), 500);
    const pick = (current: number, len: number) => {
      let next = Math.floor(Math.random() * len);
      if (next === current) next = (next + 1) % len;
      return next;
    };
    setChipIdx(([a, b, c]) => [
      pick(a, CHIP_VARIANTS[0].length),
      pick(b, CHIP_VARIANTS[1].length),
      pick(c, CHIP_VARIANTS[2].length),
    ] as [number, number, number]);
    if (typingRef.current) clearInterval(typingRef.current);
    if (buildTimerRef.current) clearTimeout(buildTimerRef.current);
    setActiveChip(null);
    setPanelState("default");
    setText("");
    setActiveQuestion("");
  };

  // Typing animation
  useEffect(() => {
    if (!activeChip || !activeQuestion) return;

    const full = activeQuestion;
    let i = 0;
    let alive = true;
    setIsTyping(true);
    setText("");

    typingRef.current = setInterval(() => {
      if (!alive) return;
      i++;
      setText(full.slice(0, i));
      if (i >= full.length) {
        if (typingRef.current) clearInterval(typingRef.current);
        setIsTyping(false);
      }
    }, 20);

    return () => {
      alive = false;
      if (typingRef.current) clearInterval(typingRef.current);
      setIsTyping(false);
    };
  }, [activeChip, activeQuestion]);

  const handleChipClick = (chip: Chip) => {
    if (activeChip === chip.id) {
      // Deselect — reset everything
      if (typingRef.current) clearInterval(typingRef.current);
      if (buildTimerRef.current) clearTimeout(buildTimerRef.current);
      setIsTyping(false);
      setActiveChip(null);
      setPanelState("default");
      setText("");
      setActiveQuestion("");
    } else {
      // Select — start building
      if (buildTimerRef.current) clearTimeout(buildTimerRef.current);
      setActiveChip(chip.id);
      setActiveQuestion(chip.question);
      setPanelState("building");
      buildTimerRef.current = setTimeout(() => setPanelState("done"), 3600);
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (typingRef.current) clearInterval(typingRef.current);
    if (buildTimerRef.current) clearTimeout(buildTimerRef.current);
    setIsTyping(false);
    setActiveChip(null);
    setPanelState("default");
    setText(e.target.value);
  };

  return (
    <>
    <section className="relative overflow-hidden bg-white">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "linear-gradient(180deg, #EFF6FF 0%, #ffffff 65%)" }}
      />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 xl:gap-20 items-center">

          {/* ── LEFT ── */}
          <div className="flex flex-col gap-6 max-w-[540px]">

            {/* Eyebrow */}
            <motion.p
              className="text-[11px] font-bold tracking-[0.16em] uppercase text-[#2563EB]"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
            >
              Ask Any Trading Question
            </motion.p>

            {/* Headline */}
            <motion.h1
              className="text-[2.6rem] sm:text-5xl xl:text-[3.1rem] font-bold leading-[1.1] tracking-tight text-[#111827]"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.08, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            >
              Get A Custom Dashboard
              <span className="block text-[#2563EB]">Built In Seconds</span>
            </motion.h1>

            {/* Subtext */}
            <motion.p
              className="text-[16.5px] leading-relaxed text-[#6B7280]"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.16 }}
            >
              Every question creates a completely different workspace designed by the AI.
            </motion.p>

            {/* Input */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.65, delay: 0.24, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              className="rounded-2xl overflow-hidden"
              style={{
                background: "#ffffff",
                border: "1px solid #E5E7EB",
                boxShadow: "0 8px 40px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)",
              }}
            >
              <div className="px-5 pt-5 pb-3">
                <textarea
                  value={text}
                  onChange={handleTextChange}
                  placeholder="What would you like to know?"
                  rows={3}
                  className="w-full text-[15px] text-[#111827] placeholder:text-[#9CA3AF] resize-none outline-none bg-transparent leading-relaxed"
                  style={{ minHeight: "80px" }}
                />
              </div>

              <div className="flex items-center justify-between px-4 py-3 border-t border-[#F5F5F5]">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-md flex items-center justify-center"
                    style={{ background: "#2563EB" }}>
                    <svg width="10" height="10" viewBox="0 0 14 14" fill="none">
                      <path d="M7 1L8.8 5.4H13.6L9.8 8L11.4 12.5L7 9.8L2.6 12.5L4.2 8L0.4 5.4H5.2L7 1Z" fill="white" />
                    </svg>
                  </div>
                  <span className="text-[12px] font-semibold text-[#374151]">QuantPilot AI</span>
                </div>

                <motion.button
                  disabled={!hasText || isTyping}
                  onClick={() => {
                    if (!hasText || isTyping) return;
                    const id = activeChip ?? inferDashboard(text);
                    setOverlayDash({ id, question: text });
                  }}
                  animate={{ opacity: hasText && !isTyping ? 1 : 0.38 }}
                  whileHover={hasText && !isTyping ? { scale: 1.04 } : {}}
                  whileTap={hasText && !isTyping ? { scale: 0.96 } : {}}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[12.5px] font-semibold"
                  style={{
                    background: hasText && !isTyping ? "linear-gradient(135deg, #2563EB, #60A5FA)" : "#E5E7EB",
                    color: hasText && !isTyping ? "#ffffff" : "#9CA3AF",
                    cursor: hasText && !isTyping ? "pointer" : "not-allowed",
                  }}
                >
                  Build Dashboard
                  <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                    <path d="M2 5.5h7M6 2.5l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </motion.button>
              </div>
            </motion.div>

            {/* Chips */}
            <motion.div
              className="flex flex-wrap items-center gap-2"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.38 }}
            >
              {chips.map((chip, i) => (
                <motion.button
                  key={`${chipIdx[i]}-${chip.id}`}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.42 + i * 0.07 }}
                  onClick={() => handleChipClick(chip)}
                  className="px-3.5 py-2 rounded-full text-[12.5px] font-medium"
                  style={{
                    background: activeChip === chip.id ? "#EFF6FF" : "#F8FAFC",
                    border: activeChip === chip.id ? "1px solid #2563EB" : "1px solid #E5E7EB",
                    color: activeChip === chip.id ? "#2563EB" : "#374151",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                  whileHover={activeChip !== chip.id ? { background: "#ffffff", boxShadow: "0 2px 8px rgba(0,0,0,0.07)" } : {}}
                  whileTap={{ scale: 0.97 }}
                >
                  {chip.label}
                </motion.button>
              ))}

            </motion.div>

            {/* Shuffle button — separate row */}
            <motion.button
              onClick={shuffleChips}
              className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-full cursor-pointer self-start"
              style={{ border: "1.5px solid #E5E7EB", background: "transparent" }}
              whileHover={{ backgroundColor: "#EFF6FF", borderColor: "#2563EB", boxShadow: "0 4px 18px rgba(37,99,235,0.13)" }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.68 }}
            >
              {/* Infinity shuffle icon */}
              <motion.svg
                width="28" height="18" viewBox="0 0 28 18" fill="none"
                animate={shuffleSpin ? { rotate: 360 } : { rotate: 0 }}
                transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] }}
              >
                {/* Right loop */}
                <path d="M14 9 C17 3 23 1 24 4 C27 7 26 14 23 14 C20 14 14 9 14 9"
                  stroke="#6B7280" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" />
                {/* Right arrowhead */}
                <path d="M22 2 L24 4 L22 6"
                  stroke="#6B7280" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" />
                {/* Left loop */}
                <path d="M14 9 C11 15 5 17 4 14 C1 11 2 4 5 4 C8 4 14 9 14 9"
                  stroke="#6B7280" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" />
                {/* Left arrowhead */}
                <path d="M6 16 L4 14 L6 12"
                  stroke="#6B7280" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" />
              </motion.svg>
              <span className="text-[13px] font-medium" style={{ color: "#6B7280" }}>
                Shuffle questions
              </span>
            </motion.button>

            {/* Mobile dashboard panel */}
            <div className="lg:hidden mt-2">
              <AnimatePresence mode="wait">
                {panelState === "building" && activeChip && (
                  <motion.div key={`mob-building-${activeChip}`}
                    initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                  >
                    <BuildingAnimation chipId={activeChip} />
                  </motion.div>
                )}
                {panelState === "done" && activeChip && (
                  <motion.div key={`mob-done-${activeChip}`}
                    initial={{ opacity: 0, y: 12, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                  >
                    <DynamicDashboard id={activeChip} question={text || undefined} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>

          {/* ── RIGHT ── */}
          <motion.div
            className="hidden lg:flex justify-center"
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          >
            <AnimatePresence mode="wait">
              {panelState === "building" && activeChip ? (
                <motion.div key={`building-${activeChip}`}
                  initial={{ opacity: 0, scale: 0.96, y: 12 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97, y: -8 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                >
                  <BuildingAnimation chipId={activeChip} />
                </motion.div>
              ) : panelState === "done" && activeChip ? (
                <motion.div key={`done-${activeChip}`}
                  initial={{ opacity: 0, scale: 0.96, y: 16 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97, y: -8 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                >
                  <DynamicDashboard id={activeChip} question={text || undefined} />
                </motion.div>
              ) : (
                <motion.div key="default"
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.4 }}
                >
                  <DashboardMockup />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

        </div>
      </div>
    </section>

    <AnimatePresence>
      {overlayDash && (
        <HeroDashOverlay
          id={overlayDash.id}
          question={overlayDash.question}
          onClose={() => setOverlayDash(null)}
        />
      )}
    </AnimatePresence>
    </>
  );
}
