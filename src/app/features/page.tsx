"use client";

import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";

function fade(delay = 0) {
  return {
    initial: { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  };
}

const features = [
  {
    tag: "Core",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <rect x="2" y="2" width="8" height="8" rx="2" stroke="#2563EB" strokeWidth="1.6" />
        <rect x="12" y="2" width="8" height="8" rx="2" stroke="#2563EB" strokeWidth="1.6" />
        <rect x="2" y="12" width="8" height="8" rx="2" stroke="#2563EB" strokeWidth="1.6" />
        <rect x="12" y="12" width="8" height="8" rx="2" stroke="#60A5FA" strokeWidth="1.6" strokeDasharray="2 1.5" />
      </svg>
    ),
    title: "AI Dashboard Builder",
    desc: "Type any trading question. The AI selects the right data, the right layout, and builds a live dashboard in under 5 seconds.",
    stat: "< 5s average build time",
    statColor: "#2563EB",
  },
  {
    tag: "Research",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M3 16 L7 10 L11 13 L15 6 L19 9" stroke="#2563EB" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="19" cy="9" r="2" fill="#60A5FA" />
      </svg>
    ),
    title: "FII/DII Flow Monitor",
    desc: "Track institutional money movement across cash and F&O with 60-day history, sector breakdown, and Nifty correlation.",
    stat: "14 segments tracked daily",
    statColor: "#2563EB",
  },
  {
    tag: "Options",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M4 18 C6 14 9 8 11 11 C13 14 16 6 19 4" stroke="#2563EB" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="4" y1="11" x2="19" y2="11" stroke="#E5E7EB" strokeWidth="1" strokeDasharray="2 2" />
      </svg>
    ),
    title: "Live Options Greeks",
    desc: "See delta, theta, vega, and gamma across all open positions in real time. Know your exact risk before the market moves against you.",
    stat: "Real-time across all brokers",
    statColor: "#D97706",
  },
  {
    tag: "Risk",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M4 18 C6 15 8 9 11 12 C14 15 16 7 19 4" stroke="#EF4444" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M4 11 h14" stroke="#E5E7EB" strokeWidth="1" strokeDasharray="2 2" />
        <circle cx="11" cy="12" r="2.5" fill="white" stroke="#EF4444" strokeWidth="1.5" />
      </svg>
    ),
    title: "Portfolio Stress Test",
    desc: "Model a Nifty crash, VIX spike, or global sell-off. See your P&L across every scenario before it happens.",
    stat: "500+ scenarios modelled instantly",
    statColor: "#EF4444",
  },
  {
    tag: "Connectivity",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <circle cx="5" cy="11" r="2.5" stroke="#2563EB" strokeWidth="1.6" />
        <circle cx="17" cy="5" r="2.5" stroke="#2563EB" strokeWidth="1.6" />
        <circle cx="17" cy="17" r="2.5" stroke="#2563EB" strokeWidth="1.6" />
        <line x1="7.5" y1="10" x2="14.5" y2="6" stroke="#BFDBFE" strokeWidth="1.4" />
        <line x1="7.5" y1="12" x2="14.5" y2="16" stroke="#BFDBFE" strokeWidth="1.4" />
      </svg>
    ),
    title: "Multi-Broker Connect",
    desc: "Connect Zerodha, ICICI Direct, Angel One, and more. One unified portfolio view across all your accounts simultaneously.",
    stat: "3 brokers in beta · more coming",
    statColor: "#2563EB",
  },
  {
    tag: "Alerts",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M11 3 C7.5 3 5 5.5 5 9 L5 15 L3 17 H19 L17 15 V9 C17 5.5 14.5 3 11 3Z" stroke="#2563EB" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M9 17 C9 18.1 9.9 19 11 19 C12.1 19 13 18.1 13 17" stroke="#2563EB" strokeWidth="1.5" />
        <circle cx="17" cy="5" r="3" fill="#EF4444" stroke="white" strokeWidth="1.5" />
      </svg>
    ),
    title: "Smart Risk Alerts",
    desc: "Get notified when your delta crosses a threshold, when theta decay accelerates, or when your margin buffer drops below a safe level.",
    stat: "Custom thresholds per position",
    statColor: "#EF4444",
  },
];

export default function FeaturesPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden py-20 sm:py-28"
        style={{ background: "radial-gradient(ellipse 80% 50% at 50% 0%, #EFF6FF 0%, #ffffff 70%)" }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold mb-6"
              style={{ background: "#EFF6FF", color: "#2563EB", border: "1px solid #BFDBFE" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB] animate-pulse inline-block" />
              Built for Indian F&amp;O Traders
            </span>
          </motion.div>

          <motion.h1
            className="text-[2.5rem] sm:text-5xl font-bold text-[#111827] tracking-tight leading-[1.1] mb-5"
            initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}>
            Every tool a serious trader<br />
            <span className="text-[#2563EB]">needs — in one place.</span>
          </motion.h1>

          <motion.p
            className="text-[16px] text-[#6B7280] leading-relaxed mb-8 max-w-xl mx-auto"
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.16 }}>
            QuantPilot connects your data, builds your dashboards, and answers your trading questions before the market moves.
          </motion.p>

          <motion.div className="flex flex-col sm:flex-row items-center justify-center gap-3"
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.24 }}>
            <a href="/request-access"
              className="px-6 py-3 rounded-xl text-[14px] font-semibold text-white"
              style={{ background: "linear-gradient(135deg, #2563EB, #60A5FA)", boxShadow: "0 4px 18px rgba(37,99,235,0.28)" }}>
              Get Early Access — Free
            </a>
            <a href="/schedule-demo"
              className="px-6 py-3 rounded-xl text-[14px] font-semibold text-[#374151]"
              style={{ border: "1px solid #E5E7EB", background: "white" }}>
              Watch a Demo
            </a>
          </motion.div>
        </div>
      </section>

      {/* Steps section */}
      <section className="py-16 border-y border-[#E5E7EB]" style={{ background: "#FAFBFF" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { num: "01", title: "Ask anything", desc: "Type any trading question in plain English." },
              { num: "02", title: "AI builds it", desc: "Live data is fetched and the dashboard is assembled in seconds." },
              { num: "03", title: "Explore & act", desc: "Interact with the dashboard, switch views, or ask a follow-up." },
            ].map((step, i) => (
              <motion.div key={step.num} className="flex items-start gap-4" {...fade(i * 0.1)}>
                <span className="text-[2rem] font-black text-[#E5E7EB] leading-none mt-0.5 select-none">{step.num}</span>
                <div>
                  <h3 className="text-[16px] font-semibold text-[#111827] mb-1">{step.title}</h3>
                  <p className="text-[13.5px] text-[#6B7280]">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div className="text-center mb-14" {...fade(0)}>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#111827] tracking-tight">
              What you get with QuantPilot
            </h2>
            <p className="mt-3 text-[15px] text-[#6B7280]">Six intelligence modules. One unified platform.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <motion.div key={f.title}
                className="p-6 rounded-2xl group hover:shadow-lg transition-shadow duration-300"
                style={{ background: "#F8FAFC", border: "1px solid #E5E7EB" }}
                {...fade(i * 0.07)}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: "white", border: "1px solid #E5E7EB" }}>
                  {f.icon}
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-[16px] font-semibold text-[#111827]">{f.title}</h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                    style={{ background: "#EFF6FF", color: "#2563EB" }}>{f.tag}</span>
                </div>
                <p className="text-[13.5px] text-[#6B7280] leading-relaxed mb-4">{f.desc}</p>
                <div className="flex items-center gap-1.5 pt-3 border-t border-[#E5E7EB]">
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: f.statColor }} />
                  <p className="text-[11.5px] font-medium" style={{ color: f.statColor }}>{f.stat}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16 mx-4 sm:mx-6 lg:mx-12 mb-16 rounded-3xl overflow-hidden"
        style={{ background: "linear-gradient(135deg, #1D4ED8 0%, #2563EB 50%, #3B82F6 100%)" }}>
        <div className="max-w-2xl mx-auto px-6 text-center">
          <motion.div {...fade(0)}>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 tracking-tight">
              Ready to trade smarter?
            </h2>
            <p className="text-[15px] text-blue-100 mb-7">
              Join 340+ traders already on the waitlist. Free during beta.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <a href="/request-access"
                className="px-6 py-3 rounded-xl text-[14px] font-semibold text-[#1D4ED8] bg-white hover:bg-[#F0F7FF] transition-colors">
                Get Early Access — Free
              </a>
              <a href="/pricing"
                className="px-6 py-3 rounded-xl text-[14px] font-semibold text-white"
                style={{ border: "1px solid rgba(255,255,255,0.3)" }}>
                See Pricing
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
