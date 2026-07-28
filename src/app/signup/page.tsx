"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import Navbar from "@/components/Navbar";

const inputCls = "w-full px-4 py-2.5 rounded-xl text-[14px] text-[#111827] placeholder:text-[#9CA3AF] outline-none transition-all";
const inputStyle = { background: "#fff", border: "1px solid #E5E7EB" };

export default function SignupPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { full_name: form.name },
        emailRedirectTo: `${window.location.origin}/welcome`,
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    setDone(true);
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      <section className="max-w-md mx-auto px-4 sm:px-6 py-20">

        <AnimatePresence mode="wait">
          {done ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              className="rounded-3xl p-10 flex flex-col items-center text-center"
              style={{ background: "#F8FAFC", border: "1px solid #E5E7EB" }}
            >
              <div className="w-16 h-16 rounded-full bg-[#DCFCE7] flex items-center justify-center mb-5">
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                  <path d="M6 14l5 5L22 8" stroke="#22C55E" strokeWidth="2.5"
                    strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h2 className="text-[1.5rem] font-bold text-[#111827] mb-2">Check your email</h2>
              <p className="text-[13.5px] text-[#6B7280] leading-relaxed max-w-xs">
                We sent a confirmation link to{" "}
                <span className="font-semibold text-[#111827]">{form.email}</span>.
                Click it to activate your account, then sign in.
              </p>
              <a
                href="/login"
                className="mt-6 px-5 py-2.5 rounded-xl text-[13.5px] font-semibold text-[#2563EB] inline-block"
                style={{ border: "1px solid #BFDBFE", background: "#EFF6FF" }}
              >
                Go to Sign In
              </a>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              className="rounded-3xl p-8 flex flex-col gap-5"
              style={{ background: "#F8FAFC", border: "1px solid #E5E7EB" }}
            >
              {/* Header */}
              <div className="text-center mb-2">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-4"
                  style={{ background: "#2563EB" }}>
                  <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
                    <path d="M3 12.5L8 3.5L13 12.5M5.5 9.5H10.5" stroke="white" strokeWidth="2"
                      strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <h1 className="text-[1.6rem] font-bold text-[#111827] tracking-tight">Create your account</h1>
                <p className="text-[13.5px] text-[#6B7280] mt-1">Start trading smarter with QuantPilot</p>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12.5px] font-semibold text-[#374151]">Full Name</label>
                  <input
                    required
                    type="text"
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                    placeholder="Arjun Mehta"
                    className={inputCls}
                    style={inputStyle}
                    autoComplete="name"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[12.5px] font-semibold text-[#374151]">Email</label>
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                    placeholder="you@example.com"
                    className={inputCls}
                    style={inputStyle}
                    autoComplete="email"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[12.5px] font-semibold text-[#374151]">Password</label>
                  <input
                    required
                    type="password"
                    value={form.password}
                    onChange={(e) => set("password", e.target.value)}
                    placeholder="Min. 8 characters"
                    minLength={8}
                    className={inputCls}
                    style={inputStyle}
                    autoComplete="new-password"
                  />
                </div>

                {/* Error message */}
                <AnimatePresence>
                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-[12.5px] text-[#DC2626] px-3 py-2 rounded-lg"
                      style={{ background: "#FEF2F2", border: "1px solid #FECACA" }}
                    >
                      {error}
                    </motion.p>
                  )}
                </AnimatePresence>

                <motion.button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl text-[14.5px] font-semibold text-white mt-1 cursor-pointer"
                  style={{
                    background: loading ? "#93C5FD" : "linear-gradient(135deg, #2563EB, #60A5FA)",
                    boxShadow: loading ? "none" : "0 4px 16px rgba(37,99,235,0.28)",
                  }}
                  whileHover={!loading ? { scale: 1.015 } : {}}
                  whileTap={!loading ? { scale: 0.98 } : {}}
                >
                  {loading ? "Creating account…" : "Create Account →"}
                </motion.button>
              </form>

              <p className="text-[12.5px] text-center text-[#9CA3AF]">
                Already have an account?{" "}
                <a href="/login" className="text-[#2563EB] font-semibold hover:underline">
                  Sign in
                </a>
              </p>
            </motion.div>
          )}
        </AnimatePresence>

      </section>
    </main>
  );
}
