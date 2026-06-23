"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import { motion, AnimatePresence } from "framer-motion";

const ROLES = ["Individual Trader", "Portfolio Manager", "Research Analyst", "Algo Trader", "Prop Desk", "Fund Manager", "Other"];
const SLOTS = ["9:00 AM – 10:00 AM", "11:00 AM – 12:00 PM", "2:00 PM – 3:00 PM", "4:00 PM – 5:00 PM", "6:00 PM – 7:00 PM"];

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

export default function ScheduleDemo() {
  const [form, setForm] = useState({ name: "", email: "", company: "", role: "", date: "", time: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 lg:py-24">
        <div className="grid lg:grid-cols-[400px_1fr] gap-12 xl:gap-20 items-start">

          {/* ── Left: info panel ── */}
          <div className="flex flex-col gap-6">
            <div>
              <span className="text-[11px] font-bold tracking-[0.14em] uppercase text-[#2563EB]">Book a Session</span>
              <h1 className="text-[2.4rem] font-bold text-[#111827] mt-3 mb-3 leading-[1.15] tracking-tight">
                See QuantPilot AI<br />in 20 Minutes
              </h1>
              <p className="text-[#6B7280] text-base leading-relaxed">
                Watch the AI build a live trading dashboard from a single question — on your data, in real time.
              </p>
            </div>

            {/* What you'll see */}
            <div className="rounded-2xl p-5" style={{ background: "#F8FAFC", border: "1px solid #E5E7EB" }}>
              <p className="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF] mb-4">What we cover</p>
              <ul className="space-y-3">
                {[
                  "Live AI dashboard generation from a plain question",
                  "FII/DII flows, options Greeks and stress testing",
                  "How QuantPilot connects to your broker and data feeds",
                  "Q&A — ask anything about the product",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-[#EFF6FF] flex items-center justify-center shrink-0 mt-0.5">
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M2 5l2 2 4-4" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <span className="text-[13.5px] text-[#374151] leading-snug">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { v: "20 min", l: "Session" },
                { v: "Live", l: "Real-time" },
                { v: "Free", l: "No cost" },
              ].map((s) => (
                <div key={s.l} className="rounded-xl p-3.5 text-center" style={{ background: "#F8FAFC", border: "1px solid #E5E7EB" }}>
                  <p className="text-[17px] font-bold text-[#111827]">{s.v}</p>
                  <p className="text-[11px] text-[#9CA3AF] mt-0.5">{s.l}</p>
                </div>
              ))}
            </div>

            {/* Contact note */}
            <p className="text-[12px] text-[#9CA3AF] leading-relaxed">
              We'll confirm your slot via email within a few hours. For urgent requests write to{" "}
              <span className="text-[#2563EB]">hello@quantpilot.io</span>
            </p>
          </div>

          {/* ── Right: form ── */}
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
                <h2 className="text-2xl font-bold text-[#111827] mb-2">Request Received!</h2>
                <p className="text-[#6B7280] leading-relaxed max-w-sm">
                  We&apos;ve got your demo request. Our team will reach out within 24 hours to confirm your session slot.
                </p>
                <button onClick={() => setSubmitted(false)}
                  className="mt-6 px-5 py-2.5 rounded-xl text-sm font-semibold text-[#2563EB] cursor-pointer"
                  style={{ border: "1px solid #BFDBFE", background: "#EFF6FF" }}>
                  Book another slot
                </button>
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
                      placeholder="Rahul Sharma" className={inputCls} style={inputStyle} />
                  </Field>
                  <Field label="Work Email *">
                    <input required type="email" value={form.email} onChange={(e) => set("email", e.target.value)}
                      placeholder="rahul@firm.com" className={inputCls} style={inputStyle} />
                  </Field>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Company / Firm">
                    <input value={form.company} onChange={(e) => set("company", e.target.value)}
                      placeholder="Acme Capital" className={inputCls} style={inputStyle} />
                  </Field>
                  <Field label="Your Role">
                    <select value={form.role} onChange={(e) => set("role", e.target.value)}
                      className={inputCls} style={{ ...inputStyle, color: form.role ? "#111827" : "#9CA3AF" }}>
                      <option value="">Select role</option>
                      {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </Field>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Preferred Date *">
                    <input required type="date" value={form.date} onChange={(e) => set("date", e.target.value)}
                      className={inputCls} style={inputStyle} min={new Date().toISOString().split("T")[0]} />
                  </Field>
                  <Field label="Preferred Time Slot *">
                    <select required value={form.time} onChange={(e) => set("time", e.target.value)}
                      className={inputCls} style={{ ...inputStyle, color: form.time ? "#111827" : "#9CA3AF" }}>
                      <option value="">Select time (IST)</option>
                      {SLOTS.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </Field>
                </div>

                <Field label="What would you like to explore?">
                  <textarea value={form.message} onChange={(e) => set("message", e.target.value)}
                    placeholder="e.g. options portfolio analytics, FII flow dashboards, stress testing..."
                    rows={3}
                    className={inputCls + " resize-none"} style={inputStyle} />
                </Field>

                <motion.button type="submit"
                  className="w-full py-3.5 rounded-xl text-[15px] font-semibold text-white cursor-pointer mt-1"
                  style={{ background: "linear-gradient(135deg, #2563EB, #60A5FA)", boxShadow: "0 4px 16px rgba(37,99,235,0.28)" }}
                  whileHover={{ scale: 1.015, boxShadow: "0 6px 24px rgba(37,99,235,0.36)" }}
                  whileTap={{ scale: 0.98 }}>
                  Book My Demo Slot →
                </motion.button>

                <p className="text-[11.5px] text-center text-[#9CA3AF]">
                  No spam. We&apos;ll only contact you to confirm your session.
                </p>
              </motion.form>
            )}
          </AnimatePresence>

        </div>
      </section>
    </main>
  );
}
