"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import { motion, AnimatePresence } from "framer-motion";

const STYLES = ["Intraday", "Swing Trading", "Options / F&O", "Positional", "Algo / Quant", "Long-term Investing"];
const EXPERIENCE = ["< 1 year", "1 – 3 years", "3 – 5 years", "5 – 10 years", "10+ years"];
const BROKERS = ["Zerodha", "Upstox", "Angel One", "Groww", "ICICI Direct", "HDFC Securities", "5Paisa", "Other"];

const PERKS = [
  { icon: "⚡", title: "Early Access", desc: "Be first in line when we open beta slots." },
  { icon: "💬", title: "Direct Feedback Channel", desc: "Shape the product — your feedback goes straight to the team." },
  { icon: "🎁", title: "Founder's Pricing", desc: "Lock in a discounted rate before public launch." },
];

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[12.5px] font-semibold text-[#374151]">{label}</label>
      {children}
    </div>
  );
}

const inputCls = "w-full px-4 py-2.5 rounded-xl text-[14px] text-[#111827] placeholder:text-[#9CA3AF] outline-none transition-all";
const inputStyle = { background: "#fff", border: "1px solid #E5E7EB" };

export default function RequestAccess() {
  const [form, setForm] = useState({ name: "", email: "", style: "", broker: "", experience: "", why: "" });
  const [submitted, setSubmitted] = useState(false);

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16 lg:py-24">

        {/* ── Header ── */}
        <div className="text-center mb-14">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-[0.1em] uppercase mb-5"
            style={{ background: "#FEF3C7", color: "#D97706", border: "1px solid #FDE68A" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] animate-pulse inline-block" />
            Limited Beta — Accepting Applications
          </span>
          <h1 className="text-[2.8rem] font-bold text-[#111827] leading-[1.12] tracking-tight mb-4">
            Request Early Access
          </h1>
          <p className="text-[#6B7280] text-lg leading-relaxed max-w-xl mx-auto">
            QuantPilot is in private beta. Apply below and we&apos;ll notify you when your slot opens — selected traders get founder pricing.
          </p>
        </div>

        <div className="grid lg:grid-cols-[1fr_360px] gap-10 xl:gap-14 items-start">

          {/* ── Left: form ── */}
          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div key="success"
                initial={{ opacity: 0, scale: 0.96, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                className="rounded-3xl p-12 flex flex-col items-center text-center"
                style={{ background: "#F8FAFC", border: "1px solid #E5E7EB" }}>
                <div className="w-16 h-16 rounded-full bg-[#DCFCE7] flex items-center justify-center mb-5">
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                    <path d="M6 14l5 5L22 8" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-[#111827] mb-2">You&apos;re on the list!</h2>
                <p className="text-[#6B7280] leading-relaxed max-w-sm mb-6">
                  We&apos;ve received your application. We review requests weekly — you&apos;ll hear from us as soon as your slot opens.
                </p>
                <div className="flex flex-wrap gap-3 justify-center">
                  <button onClick={() => setSubmitted(false)}
                    className="px-5 py-2.5 rounded-xl text-sm font-semibold text-[#2563EB] cursor-pointer"
                    style={{ border: "1px solid #BFDBFE", background: "#EFF6FF" }}>
                    Submit another
                  </button>
                  <a href="/schedule-demo"
                    className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white cursor-pointer inline-block"
                    style={{ background: "linear-gradient(135deg, #2563EB, #60A5FA)" }}>
                    Book a Demo instead
                  </a>
                </div>
              </motion.div>
            ) : (
              <motion.form key="form" onSubmit={handleSubmit}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                className="rounded-3xl p-8 flex flex-col gap-5"
                style={{ background: "#F8FAFC", border: "1px solid #E5E7EB" }}>

                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Full Name *">
                    <input required value={form.name} onChange={(e) => set("name", e.target.value)}
                      placeholder="Arjun Mehta" className={inputCls} style={inputStyle} />
                  </Field>
                  <Field label="Email Address *">
                    <input required type="email" value={form.email} onChange={(e) => set("email", e.target.value)}
                      placeholder="arjun@example.com" className={inputCls} style={inputStyle} />
                  </Field>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Trading Style *">
                    <select required value={form.style} onChange={(e) => set("style", e.target.value)}
                      className={inputCls} style={{ ...inputStyle, color: form.style ? "#111827" : "#9CA3AF" }}>
                      <option value="">Select your style</option>
                      {STYLES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </Field>
                  <Field label="Primary Broker *">
                    <select required value={form.broker} onChange={(e) => set("broker", e.target.value)}
                      className={inputCls} style={{ ...inputStyle, color: form.broker ? "#111827" : "#9CA3AF" }}>
                      <option value="">Select broker</option>
                      {BROKERS.map((b) => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </Field>
                </div>

                <Field label="Trading Experience *">
                  <div className="flex flex-wrap gap-2">
                    {EXPERIENCE.map((e) => (
                      <button type="button" key={e} onClick={() => set("experience", e)}
                        className="px-3.5 py-1.5 rounded-lg text-[13px] font-medium cursor-pointer transition-all"
                        style={form.experience === e
                          ? { background: "#EFF6FF", border: "1.5px solid #2563EB", color: "#2563EB" }
                          : { background: "#fff", border: "1px solid #E5E7EB", color: "#6B7280" }}>
                        {e}
                      </button>
                    ))}
                  </div>
                </Field>

                <Field label="Why do you want access? (optional)">
                  <textarea value={form.why} onChange={(e) => set("why", e.target.value)}
                    placeholder="Tell us a bit about your trading setup and what you're hoping QuantPilot helps you with..."
                    rows={3}
                    className={inputCls + " resize-none"} style={inputStyle} />
                </Field>

                <motion.button type="submit"
                  className="w-full py-3.5 rounded-xl text-[15px] font-semibold text-white cursor-pointer mt-1"
                  style={{ background: "linear-gradient(135deg, #2563EB, #60A5FA)", boxShadow: "0 4px 16px rgba(37,99,235,0.28)" }}
                  whileHover={{ scale: 1.015, boxShadow: "0 6px 24px rgba(37,99,235,0.36)" }}
                  whileTap={{ scale: 0.98 }}>
                  Request Early Access →
                </motion.button>

                <p className="text-[11.5px] text-center text-[#9CA3AF]">
                  We review applications weekly. No spam, ever.
                </p>
              </motion.form>
            )}
          </AnimatePresence>

          {/* ── Right: perks + counter ── */}
          <div className="flex flex-col gap-5">

            {/* Perks */}
            {PERKS.map((p) => (
              <div key={p.title} className="flex items-start gap-4 rounded-2xl p-4"
                style={{ background: "#F8FAFC", border: "1px solid #E5E7EB" }}>
                <span className="text-2xl leading-none mt-0.5">{p.icon}</span>
                <div>
                  <p className="text-[13.5px] font-semibold text-[#111827] mb-0.5">{p.title}</p>
                  <p className="text-[12.5px] text-[#6B7280] leading-snug">{p.desc}</p>
                </div>
              </div>
            ))}

            {/* Social proof */}
            <div className="rounded-2xl p-5" style={{ background: "#F8FAFC", border: "1px solid #E5E7EB" }}>
              <p className="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF] mb-3">Already waiting</p>
              <div className="flex items-end gap-3 mb-3">
                <p className="text-[2.2rem] font-bold text-[#111827] leading-none">340+</p>
                <p className="text-[13px] text-[#6B7280] mb-1 leading-snug">traders on<br />the waitlist</p>
              </div>
              <div className="h-2 rounded-full bg-[#E5E7EB] overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-[#2563EB] to-[#60A5FA]" style={{ width: "72%" }} />
              </div>
              <p className="text-[11px] text-[#9CA3AF] mt-2">Beta slots are ~72% full</p>
            </div>

            {/* Already have a demo? */}
            <div className="rounded-2xl p-4 text-center" style={{ background: "#FFFBEB", border: "1px solid #FDE68A" }}>
              <p className="text-[12.5px] text-[#92400E] leading-snug mb-2">
                Want to see QuantPilot in action first?
              </p>
              <a href="/schedule-demo"
                className="text-[12.5px] font-semibold text-[#D97706] hover:underline cursor-pointer">
                Book a 20-min demo →
              </a>
            </div>

          </div>
        </div>
      </section>
    </main>
  );
}
