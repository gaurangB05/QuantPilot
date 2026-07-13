"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import Navbar from "@/components/Navbar";

const inputCls = "w-full px-4 py-2.5 rounded-xl text-[14px] text-[#111827] placeholder:text-[#9CA3AF] outline-none transition-all";
const inputStyle = { background: "#fff", border: "1px solid #E5E7EB" };

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  };

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      <section className="max-w-md mx-auto px-4 sm:px-6 py-20">

        <motion.div
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
            <h1 className="text-[1.6rem] font-bold text-[#111827] tracking-tight">Welcome back</h1>
            <p className="text-[13.5px] text-[#6B7280] mt-1">Sign in to your QuantPilot account</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
                placeholder="••••••••"
                className={inputCls}
                style={inputStyle}
                autoComplete="current-password"
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
              {loading ? "Signing in…" : "Sign In →"}
            </motion.button>
          </form>

          <p className="text-[12.5px] text-center text-[#9CA3AF]">
            Don&apos;t have an account?{" "}
            <a href="/signup" className="text-[#2563EB] font-semibold hover:underline">
              Sign up
            </a>
          </p>
        </motion.div>

      </section>
    </main>
  );
}
