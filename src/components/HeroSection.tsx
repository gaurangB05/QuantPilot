"use client";

import { useState, FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DashboardMockup from "./DashboardMockup";
import { siteConfig } from "@/lib/config";

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
};

function CheckIcon() {
  return (
    <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <circle cx="7" cy="7" r="6.5" fill="#EFF6FF" />
      <path d="M4 7L6 9.5L10 4.5" stroke="#2563EB" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Spinner() {
  return (
    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25" />
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
    <section className="relative overflow-hidden bg-white">

      {/* Subtle background — clean white with very light blue tint at top */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div style={{ background: "linear-gradient(180deg, #EFF6FF 0%, #ffffff 55%)", position: "absolute", inset: 0 }} />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 xl:gap-20 items-center">

          {/* ── LEFT ── */}
          <motion.div variants={stagger} initial="hidden" animate="show"
            className="flex flex-col gap-7 max-w-[540px]">

            {/* Badge */}
            <motion.div variants={fadeUp}>
              <span className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.08em] uppercase text-[#2563EB] bg-[#EFF6FF] px-3.5 py-1.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB] inline-block" />
                {hero.badge}
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1 variants={fadeUp}
              className="text-[2.6rem] sm:text-5xl xl:text-[3.2rem] font-bold leading-[1.1] tracking-tight text-[#111827]">
              {hero.headlineParts.map((part, i) =>
                part.gradient ? (
                  <span key={i} className="block text-[#2563EB]">{part.text}</span>
                ) : (
                  <span key={i} className="block">{part.text}</span>
                )
              )}
            </motion.h1>

            {/* Subheadline */}
            <motion.p variants={fadeUp}
              className="text-[17px] leading-relaxed text-[#6B7280]">
              {hero.subheadline}
            </motion.p>

            {/* CTA buttons */}
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3">
              <button
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold text-white rounded-xl transition-all duration-200"
                style={{ background: "#2563EB", boxShadow: "0 2px 8px rgba(37,99,235,0.25)" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#1d4ed8"; (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 16px rgba(37,99,235,0.35)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#2563EB"; (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 2px 8px rgba(37,99,235,0.25)"; }}
              >
                {hero.ctaPrimary}
                <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-medium text-[#374151] rounded-xl border border-[#e5e7eb] bg-white hover:bg-[#F8FAFC] hover:border-[#d1d5db] transition-all duration-200">
                <svg className="w-4 h-4 text-[#6B7280]" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="6.25" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M6.5 5.5L11 8L6.5 10.5V5.5Z" fill="currentColor" />
                </svg>
                {hero.ctaSecondary}
              </button>
            </motion.div>

            {/* Trust items */}
            <motion.div variants={fadeUp} className="flex flex-wrap gap-x-5 gap-y-2">
              {hero.trust.map((t) => (
                <div key={t} className="flex items-center gap-2">
                  <CheckIcon />
                  <span className="text-[13px] text-[#6B7280]">{t}</span>
                </div>
              ))}
            </motion.div>

            <motion.div variants={fadeUp} className="h-px bg-[#e5e7eb]" />

            {/* Social proof + email */}
            <motion.div variants={fadeUp} className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-1.5">
                  {["#2563EB", "#0891B2", "#059669", "#7C3AED"].map((bg, i) => (
                    <div key={i} className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white ring-2 ring-white"
                      style={{ background: bg }}>
                      {["R", "A", "V", "S"][i]}
                    </div>
                  ))}
                </div>
                <p className="text-sm text-[#6B7280]">
                  <span className="font-semibold text-[#111827]">120+ traders</span> already on the waitlist
                </p>
              </div>

              <AnimatePresence mode="wait">
                {!submitted ? (
                  <motion.form key="form" exit={{ opacity: 0, y: -4 }} onSubmit={handleSubmit}
                    className="flex flex-col sm:flex-row gap-2">
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                      placeholder={hero.emailPlaceholder} required
                      className="flex-1 text-sm text-[#111827] placeholder:text-[#9CA3AF] bg-[#F8FAFC] border border-[#e5e7eb] rounded-xl px-4 py-3 outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10 transition-all" />
                    <button type="submit" disabled={loading}
                      className="shrink-0 inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-white rounded-xl transition-all disabled:opacity-60"
                      style={{ background: "#111827" }}>
                      {loading ? <Spinner /> : hero.emailCta}
                    </button>
                  </motion.form>
                ) : (
                  <motion.div key="success" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 rounded-xl px-4 py-3.5 bg-[#F0FDF4] border border-[#BBF7D0]">
                    <div className="w-7 h-7 rounded-full bg-[#DCFCE7] flex items-center justify-center shrink-0">
                      <svg className="w-3.5 h-3.5 text-[#16A34A]" viewBox="0 0 14 14" fill="none">
                        <path d="M2.5 7L5.5 10L11.5 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-[#15803D]">{hero.emailSuccess}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>

          {/* ── RIGHT — Dashboard ── */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            className="hidden lg:block"
          >
            <DashboardMockup />
          </motion.div>

        </div>
      </div>
    </section>
  );
}
