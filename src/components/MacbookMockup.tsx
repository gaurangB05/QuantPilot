"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Thinking messages ────────────────────────────────────────────────────────

const STEPS = [
  "Connecting to brokers...",
  "Reading portfolio...",
  "Calculating risk exposure...",
  "Analyzing option chain...",
  "Tracking institutional flow...",
  "Building dashboard...",
  "Generating insights...",
  "Preparing widgets...",
  "Designing workspace...",
  "Finalizing dashboard...",
];

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  selectedQuestion: string | null;
  isThinking: boolean;
  onThinkingComplete: () => void;
}

// ─── Sparkle icon ─────────────────────────────────────────────────────────────

function Sparkle({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path
        d="M9 1L10.5 7.5L17 9L10.5 10.5L9 17L7.5 10.5L1 9L7.5 7.5L9 1Z"
        fill="white"
      />
    </svg>
  );
}

// ─── Screen content states ────────────────────────────────────────────────────

function IdleScreen() {
  return (
    <motion.div
      key="idle"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      className="flex-1 flex flex-col items-center justify-center text-center px-6"
    >
      <div
        className="w-11 h-11 rounded-2xl flex items-center justify-center mb-4"
        style={{
          background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)",
          boxShadow: "0 8px 24px rgba(37,99,235,0.25)",
        }}
      >
        <Sparkle />
      </div>
      <h3 className="text-[13px] font-semibold text-gray-900 leading-snug mb-2.5">
        What would you like to know
        <br />
        about your trading today?
      </h3>
      <p className="text-[10px] text-gray-400 leading-relaxed max-w-[240px]">
        Design your own trading dashboard using natural language. Get portfolio analytics, options
        insights, FII/DII flows, risk metrics, trade journals and execution workflows in one place.
      </p>
    </motion.div>
  );
}

function ThinkingScreen({ step }: { step: number }) {
  const progress = Math.round(((step + 1) / STEPS.length) * 100);
  return (
    <motion.div
      key="thinking"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="flex-1 flex flex-col items-center justify-center"
    >
      {/* Pulsing dots */}
      <div className="flex gap-1.5 mb-5">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="block w-2 h-2 rounded-full"
            style={{ background: "linear-gradient(135deg, #2563eb, #7c3aed)" }}
            animate={{ scale: [1, 1.55, 1], opacity: [0.45, 1, 0.45] }}
            transition={{ duration: 0.75, delay: i * 0.17, repeat: Infinity }}
          />
        ))}
      </div>

      {/* Cycling message */}
      <div className="h-5 flex items-center justify-center overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.p
            key={step}
            initial={{ opacity: 0, y: 7 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -7 }}
            transition={{ duration: 0.22 }}
            className="text-[11px] font-medium text-gray-600 tracking-tight"
          >
            {STEPS[step]}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Progress bar */}
      <div className="w-36 h-[2px] bg-gray-100 rounded-full mt-5 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: "linear-gradient(90deg, #2563eb, #7c3aed)" }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.38, ease: "easeOut" }}
        />
      </div>
      <p className="text-[9px] text-gray-300 mt-1.5 tabular-nums">{progress}% complete</p>
    </motion.div>
  );
}

function DoneScreen() {
  return (
    <motion.div
      key="done"
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="flex-1 flex flex-col items-center justify-center text-center"
    >
      <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center mb-3 ring-4 ring-emerald-100">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M3 8L6.5 11.5L13 4.5" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <p className="text-[13px] font-semibold text-gray-900 mb-1">Dashboard ready</p>
      <p className="text-[10px] text-gray-400">Your personalised workspace has been created.</p>
    </motion.div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function MacbookMockup({ selectedQuestion, isThinking, onThinkingComplete }: Props) {
  const [step, setStep] = useState(0);
  const [isDone, setIsDone] = useState(false);
  const [typed, setTyped] = useState("");
  const [charIdx, setCharIdx] = useState(0);

  // Reset typewriter when question changes
  useEffect(() => {
    setTyped("");
    setCharIdx(0);
  }, [selectedQuestion]);

  // Typewriter
  useEffect(() => {
    if (!selectedQuestion || charIdx >= selectedQuestion.length) return;
    const t = setTimeout(() => {
      setTyped(selectedQuestion.slice(0, charIdx + 1));
      setCharIdx((c) => c + 1);
    }, 16);
    return () => clearTimeout(t);
  }, [selectedQuestion, charIdx]);

  // Thinking cycle
  const handleComplete = useCallback(() => {
    onThinkingComplete();
  }, [onThinkingComplete]);

  useEffect(() => {
    if (!isThinking) {
      setStep(0);
      setIsDone(false);
      return;
    }
    setStep(0);
    setIsDone(false);

    const id = setInterval(() => {
      setStep((prev) => {
        if (prev >= STEPS.length - 1) {
          clearInterval(id);
          setIsDone(true);
          setTimeout(handleComplete, 900);
          return prev;
        }
        return prev + 1;
      });
    }, 460);

    return () => clearInterval(id);
  }, [isThinking, handleComplete]);

  const screenState = isDone ? "done" : isThinking ? "thinking" : "idle";

  return (
    <div className="w-full max-w-[540px] mx-auto select-none">
      {/* ── Lid ── */}
      <div
        className="relative"
        style={{
          background: "linear-gradient(160deg, #3a3a3c 0%, #1d1d1f 100%)",
          borderRadius: "14px 14px 3px 3px",
          padding: "10px 10px 7px",
          boxShadow:
            "0 24px 56px rgba(0,0,0,0.20), 0 8px 20px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.07)",
        }}
      >
        {/* Camera */}
        <div className="absolute top-[5px] left-1/2 -translate-x-1/2 w-[5px] h-[5px] rounded-full bg-[#3d3d3f]" />

        {/* Screen */}
        <div
          className="relative overflow-hidden flex flex-col"
          style={{
            background: "#ffffff",
            borderRadius: "5px",
            aspectRatio: "16 / 10",
            minHeight: "300px",
          }}
        >
          {/* macOS menu bar */}
          <div
            className="flex items-center gap-1.5 px-3 py-[6px] shrink-0"
            style={{ background: "#f5f5f7", borderBottom: "1px solid #e8e8ed" }}
          >
            <span className="w-[10px] h-[10px] rounded-full bg-[#ff5f57]" />
            <span className="w-[10px] h-[10px] rounded-full bg-[#febc2e]" />
            <span className="w-[10px] h-[10px] rounded-full bg-[#28c840]" />
            <div className="flex-1 flex justify-center">
              <div
                className="flex items-center gap-1.5 rounded-[5px] px-3 py-[2px]"
                style={{ background: "#ffffff", border: "1px solid #e2e2e7" }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span className="text-[9px] text-gray-400 font-medium tracking-tight">
                  app.quantpilot.io — AI Dashboard
                </span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col px-5 py-3 overflow-hidden">
            <AnimatePresence mode="wait">
              {screenState === "idle" && <IdleScreen />}
              {screenState === "thinking" && <ThinkingScreen step={step} />}
              {screenState === "done" && <DoneScreen />}
            </AnimatePresence>

            {/* Chat input */}
            <div className="mt-auto shrink-0 pt-2">
              <div
                className="flex items-center gap-2 rounded-[10px] px-3 py-2"
                style={{ background: "#f5f5f7", border: "1px solid #e5e5ea" }}
              >
                <div className="flex-1 min-w-0">
                  {typed ? (
                    <span className="text-[10px] text-gray-800 block truncate">{typed}</span>
                  ) : (
                    <span className="text-[10px] text-gray-400">
                      Ask anything about your trading portfolio...
                    </span>
                  )}
                </div>
                <div
                  className="w-[22px] h-[22px] rounded-[6px] flex items-center justify-center shrink-0 transition-all"
                  style={{
                    background: typed
                      ? "linear-gradient(135deg, #2563eb, #7c3aed)"
                      : "#e5e5ea",
                  }}
                >
                  <svg width="9" height="9" viewBox="0 0 9 9" fill="none" aria-hidden="true">
                    <path
                      d="M1.5 4.5H7.5M4.5 1.5L7.5 4.5L4.5 7.5"
                      stroke={typed ? "white" : "#aaa"}
                      strokeWidth="1.3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
              <p className="text-[8px] text-gray-300 text-center mt-1">
                Powered by QuantPilot AI · Connected to your brokers
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Base ── */}
      <div className="relative" style={{ height: "16px" }}>
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(180deg, #2e2e30 0%, #1a1a1c 100%)",
            borderRadius: "0 0 10px 10px",
            boxShadow: "0 6px 18px rgba(0,0,0,0.14)",
          }}
        />
        {/* Vent slit */}
        <div
          className="absolute bottom-[4px] left-1/2 -translate-x-1/2 rounded-full"
          style={{ width: "40px", height: "2px", background: "rgba(255,255,255,0.06)" }}
        />
      </div>

      {/* ── Floor shadow ── */}
      <div
        className="mx-auto mt-1 rounded-full"
        style={{
          width: "72%",
          height: "10px",
          background: "radial-gradient(ellipse, rgba(0,0,0,0.13) 0%, transparent 70%)",
        }}
      />
    </div>
  );
}
