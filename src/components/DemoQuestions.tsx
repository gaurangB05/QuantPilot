"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { type Question, getRandomQuestions } from "@/lib/questions";
import { track } from "@/lib/analytics";

// ─── Category pill colours ────────────────────────────────────────────────────

const CATEGORY_STYLE: Record<
  Question["category"],
  { bg: string; text: string; label: string }
> = {
  pnl:           { bg: "#fef9c3", text: "#854d0e", label: "P&L" },
  options:       { bg: "#ede9fe", text: "#5b21b6", label: "Options" },
  risk:          { bg: "#fee2e2", text: "#991b1b", label: "Risk" },
  institutional: { bg: "#dbeafe", text: "#1e40af", label: "Institutional" },
  portfolio:     { bg: "#d1fae5", text: "#065f46", label: "Portfolio" },
  journal:       { bg: "#f1f5f9", text: "#334155", label: "Journal" },
};

// ─── Refresh icon ─────────────────────────────────────────────────────────────

function RefreshIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true">
      <path d="M1.5 5.5C1.5 3.29 3.29 1.5 5.5 1.5c1.22 0 2.31.54 3.05 1.4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M9.5 5.5C9.5 7.71 7.71 9.5 5.5 9.5c-1.22 0-2.31-.54-3.05-1.4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M7.8 1L9.5 2.9L7.5 3.2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  onQuestionSelect: (q: Question) => void;
  selectedId: string | null;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function DemoQuestions({ onQuestionSelect, selectedId }: Props) {
  const [cards, setCards] = useState<Question[]>([]);
  const [seenIds, setSeenIds] = useState<string[]>([]);
  const [rotating, setRotating] = useState(false);

  const loadCards = useCallback(
    (exclude: string[]) => {
      const next = getRandomQuestions(3, exclude);
      setCards(next);

      const nextIds = next.map((q) => q.id);
      setSeenIds((prev) => [...new Set([...prev, ...nextIds])]);

      // Track impressions
      nextIds.forEach((id) => {
        const q = next.find((x) => x.id === id)!;
        track("question_impression", {
          question_id: id,
          question_text: q.text,
          question_category: q.category,
          questions_shown: nextIds,
        });
      });
    },
    []
  );

  // Initial load
  useEffect(() => {
    loadCards([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRefresh = () => {
    setRotating(true);
    setTimeout(() => setRotating(false), 600);
    loadCards(seenIds);
  };

  const handleSelect = (q: Question) => {
    track("question_selected", {
      question_id: q.id,
      question_text: q.text,
      question_category: q.category,
    });
    onQuestionSelect(q);
  };

  return (
    <div className="w-full max-w-[540px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className="w-[3px] h-4 rounded-full"
            style={{ background: "linear-gradient(180deg, #2563eb, #7c3aed)" }}
          />
          <span className="text-[10.5px] font-semibold text-slate-400 tracking-[0.09em] uppercase">
            Try a demo question
          </span>
        </div>

        <button
          onClick={handleRefresh}
          className="flex items-center gap-1.5 text-[11px] font-medium text-blue-500 hover:text-blue-700 transition-colors"
          aria-label="Load new questions"
        >
          <motion.span
            animate={rotating ? { rotate: 360 } : { rotate: 0 }}
            transition={{ duration: 0.55, ease: "easeInOut" }}
            className="inline-flex"
          >
            <RefreshIcon />
          </motion.span>
          See others
        </button>
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-2">
        <AnimatePresence mode="wait">
          {cards.map((q, i) => {
            const isSelected = selectedId === q.id;
            const cat = CATEGORY_STYLE[q.category];

            return (
              <motion.div
                key={q.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.28, delay: i * 0.06 }}
              >
                <button
                  onClick={() => handleSelect(q)}
                  className="w-full text-left"
                  aria-pressed={isSelected}
                >
                  <div
                    className="relative rounded-xl px-4 py-3 transition-all duration-200"
                    style={
                      isSelected
                        ? {
                            background:
                              "linear-gradient(135deg, rgba(37,99,235,0.05) 0%, rgba(124,58,237,0.05) 100%)",
                            border: "1.5px solid rgba(37,99,235,0.28)",
                            boxShadow: "0 0 0 3px rgba(37,99,235,0.07), 0 2px 8px rgba(0,0,0,0.05)",
                          }
                        : {
                            background: "#ffffff",
                            border: "1.5px solid #e8edf2",
                            boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                          }
                    }
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(37,99,235,0.22)";
                        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 14px rgba(0,0,0,0.08)";
                        (e.currentTarget as HTMLDivElement).style.transform = "translateY(-1px)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        (e.currentTarget as HTMLDivElement).style.borderColor = "#e8edf2";
                        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 1px 4px rgba(0,0,0,0.04)";
                        (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
                      }
                    }}
                  >
                    <div className="flex items-start gap-3">
                      {/* Icon */}
                      <div
                        className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-all duration-200"
                        style={
                          isSelected
                            ? { background: "linear-gradient(135deg, #2563eb, #7c3aed)" }
                            : { background: "#f1f5f9" }
                        }
                      >
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                          {isSelected ? (
                            <path d="M2 5L4 7L8 3" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                          ) : (
                            <path d="M2 5h6M5 2l3 3-3 3" stroke="#94a3b8" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                          )}
                        </svg>
                      </div>

                      {/* Text */}
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-[12.5px] leading-relaxed transition-colors duration-150"
                          style={{ color: isSelected ? "#1d4ed8" : "#374151" }}
                        >
                          {q.text}
                        </p>
                        {/* Category pill */}
                        <span
                          className="inline-block mt-1.5 text-[9px] font-semibold px-2 py-0.5 rounded-full"
                          style={{ background: cat.bg, color: cat.text }}
                        >
                          {cat.label}
                        </span>
                      </div>

                      {/* Selected checkmark */}
                      {isSelected && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.7 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="shrink-0 mt-0.5"
                        >
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                            <circle cx="7" cy="7" r="6.5" fill="#dbeafe" />
                            <path d="M4 7L6 9.5L10 4.5" stroke="#2563eb" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Footer note */}
      <p className="text-[10px] text-slate-300 text-center mt-3">
        Questions refresh with each visit · {15} questions in the demo pool
      </p>
    </div>
  );
}
