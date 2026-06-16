"use client";

import { useState, FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DashboardMockup from "./DashboardMockup";
import DemoQuestions from "./DemoQuestions";
import { siteConfig } from "@/lib/config";

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.09 } } };

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  },
};

function Check() {
  return (
    <svg className="w-3.5 h-3.5 shrink-0 text-emerald-500" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M2 7L5.5 10.5L12 3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Spinner() {
  return (
    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.22" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export default function HeroSection() {
  const { hero } = siteConfig;

  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 900));
    setSubmitted(true);
    setLoading(false);
  }

  return (
    <section className="relative overflow-hidden">

      {/* Background */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute inset-0" style={{ background: "linear-gradient(160deg, #eff6ff 0%, #ffffff 45%, #faf5ff 100%)" }} />
        <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(circle, rgba(0,0,0,0.065) 1px, transparent 1px)", backgroundSize: "28px 28px", opacity: 0.55 }} />
        <div className="absolute -top-20 right-0 w-[600px] h-[500px]" style={{ background: "radial-gradient(ellipse at center, rgba(37,99,235,0.09) 0%, transparent 65%)" }} />
        <div className="absolute bottom-0 -left-20 w-[500px] h-[400px]" style={{ background: "radial-gradient(ellipse at center, rgba(124,58,237,0.06) 0%, transparent 65%)" }} />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(37,99,235,0.22), transparent)" }} />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 py-14 lg:py-18">
        <div className="grid lg:grid-cols-2 gap-10 xl:gap-14 items-center">

          {/* LEFT COLUMN */}
          <motion.div variants={stagger} initial="hidden" animate="show" className="flex flex-col gap-6 max-w-[560px]">

            {/* Badge */}
            <motion.div variants={fadeUp} className="flex">
              <div className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5"
                style={{ background: "rgba(37,99,235,0.07)", border: "1px solid rgba(37,99,235,0.2)" }}>
                <motion.span
                  animate={{ opacity: [1, 0.35, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500"
                />
                <span className="text-[10.5px] font-semibold tracking-[0.12em] uppercase text-blue-700">
                  {hero.badge}
                </span>
              </div>
            </motion.div>

            {/* Headline */}
            <motion.h1 variants={fadeUp} className="text-[2.5rem] sm:text-5xl xl:text-[3.4rem] font-bold leading-[1.08] tracking-tight">
              {hero.headlineParts.map((part, i) =>
                part.gradient ? (
                  <span key={i} className="block bg-gradient-to-r from-blue-600 via-violet-500 to-purple-600 bg-clip-text text-transparent">
                    {part.text}
                  </span>
                ) : (
                  <span key={i} className="block text-slate-900">{part.text}</span>
                )
              )}
            </motion.h1>

            {/* Subheadline */}
            <motion.div variants={fadeUp} className="space-y-1.5">
              <p className="text-base sm:text-[17px] leading-relaxed text-slate-500">{hero.subheadline}</p>
              <p className="text-sm font-medium text-slate-400">{hero.subNote}</p>
            </motion.div>

            {/* CTA buttons */}
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3">
              <button
                className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 text-sm font-semibold text-white rounded-xl transition-all duration-200"
                style={{
                  background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)",
                  boxShadow: "0 4px 16px rgba(37,99,235,0.35), inset 0 1px 0 rgba(255,255,255,0.15)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 8px 24px rgba(37,99,235,0.5), inset 0 1px 0 rgba(255,255,255,0.15)";
                  (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 16px rgba(37,99,235,0.35), inset 0 1px 0 rgba(255,255,255,0.15)";
                  (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
                }}
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <rect x="1.5" y="2.5" width="13" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M1.5 6h13M5.5 2.5v10M10.5 2.5v10" stroke="currentColor" strokeWidth="1" strokeOpacity="0.5" />
                </svg>
                {hero.ctaPrimary}
              </button>

              <button className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 text-sm font-medium text-slate-600 rounded-xl transition-all duration-200 border border-slate-200 bg-white hover:border-slate-300 hover:text-slate-900 hover:bg-slate-50">
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <circle cx="8" cy="8" r="6.25" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M6.5 5.5L11 8L6.5 10.5V5.5Z" fill="currentColor" />
                </svg>
                {hero.ctaSecondary}
              </button>
            </motion.div>

            {/* Trust */}
            <motion.div variants={fadeUp} className="flex flex-wrap gap-x-5 gap-y-2">
              {hero.trust.map((t) => (
                <div key={t} className="flex items-center gap-1.5">
                  <Check />
                  <span className="text-[13px] text-slate-400">{t}</span>
                </div>
              ))}
            </motion.div>

            <motion.div variants={fadeUp} className="w-full h-px bg-slate-100" />

            {/* Waitlist */}
            <motion.div variants={fadeUp} className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {[{ bg: "#2563eb", l: "R" }, { bg: "#7c3aed", l: "S" }, { bg: "#0891b2", l: "A" }, { bg: "#059669", l: "V" }].map((a, i) => (
                    <div key={i} className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                      style={{ background: a.bg, border: "2px solid #fff", zIndex: 4 - i }}>
                      {a.l}
                    </div>
                  ))}
                </div>
                <p className="text-sm text-slate-500">
                  <span className="font-semibold text-slate-700">120+ traders</span> already joined the waitlist
                </p>
              </div>

              <AnimatePresence mode="wait">
                {!submitted ? (
                  <motion.form key="form" initial={{ opacity: 1 }} exit={{ opacity: 0, y: -6 }} onSubmit={handleSubmit}
                    className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={hero.emailPlaceholder}
                      required
                      className="flex-1 text-sm text-slate-900 placeholder:text-slate-400 rounded-xl px-4 py-3 outline-none bg-white border border-slate-200 transition-all"
                      onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = "#2563eb"; (e.target as HTMLInputElement).style.boxShadow = "0 0 0 3px rgba(37,99,235,0.1)"; }}
                      onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = "#e2e8f0"; (e.target as HTMLInputElement).style.boxShadow = "none"; }}
                    />
                    <button type="submit" disabled={loading}
                      className="shrink-0 inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-white rounded-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                      style={{ background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)", boxShadow: "0 2px 8px rgba(15,23,42,0.25)" }}>
                      {loading ? <Spinner /> : hero.emailCta}
                    </button>
                  </motion.form>
                ) : (
                  <motion.div key="success" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 rounded-xl px-4 py-3.5 bg-emerald-50 border border-emerald-200">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4 text-emerald-600" viewBox="0 0 16 16" fill="none">
                        <path d="M3 8L6.5 11.5L13 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-emerald-700">{hero.emailSuccess}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>

          {/* RIGHT COLUMN — Dashboard + Demo Questions */}
          <motion.div
            initial={{ opacity: 0, x: 36 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            className="hidden lg:flex flex-col gap-8"
          >
            <DashboardMockup />

            {/* Demo Questions section */}
            <div>
              <p className="text-sm font-semibold text-slate-500 mb-4 text-center tracking-wide">
                You may check demo questions
              </p>
              <DemoQuestions onQuestionSelect={() => {}} selectedId={null} />
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
