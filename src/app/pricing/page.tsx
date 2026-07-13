"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";

function fade(delay = 0) {
  return {
    initial: { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  };
}

const plans = [
  {
    name: "Starter",
    desc: "Perfect for traders getting started with AI analytics.",
    monthly: "Free",
    annual: "Free",
    monthlySub: "forever",
    annualSub: "forever",
    cta: "Get Started — Free",
    ctaHref: "/request-access",
    highlight: false,
    features: [
      { text: "5 dashboards per day", included: true },
      { text: "1 broker connection", included: true },
      { text: "FII/DII flow tracker", included: true },
      { text: "Basic stress test (3 scenarios)", included: true },
      { text: "Dashboard history (7 days)", included: true },
      { text: "Live Options Greeks", included: false },
      { text: "Unlimited dashboards", included: false },
      { text: "Smart alerts", included: false },
      { text: "3 broker connections", included: false },
      { text: "API access", included: false },
    ],
  },
  {
    name: "Pro",
    desc: "For active F&O traders who need live intelligence every session.",
    monthly: "₹999",
    annual: "₹799",
    monthlySub: "/mo",
    annualSub: "/mo",
    cta: "Get Early Access",
    ctaHref: "/request-access",
    highlight: true,
    badge: "Most Popular",
    features: [
      { text: "Unlimited dashboards", included: true },
      { text: "3 broker connections", included: true },
      { text: "FII/DII flow tracker", included: true },
      { text: "Full stress test (500+ scenarios)", included: true },
      { text: "Dashboard history (90 days)", included: true },
      { text: "Live Options Greeks", included: true },
      { text: "Smart risk alerts", included: true },
      { text: "Sector rotation map", included: true },
      { text: "Options chain intelligence", included: true },
      { text: "API access", included: false },
    ],
  },
  {
    name: "Institutional",
    desc: "For prop desks, portfolio managers, and trading teams.",
    monthly: "Custom",
    annual: "Custom",
    monthlySub: "pricing",
    annualSub: "pricing",
    cta: "Contact Sales",
    ctaHref: "/schedule-demo",
    highlight: false,
    features: [
      { text: "Everything in Pro", included: true },
      { text: "Unlimited broker connections", included: true },
      { text: "REST API access", included: true },
      { text: "Team accounts (up to 10 users)", included: true },
      { text: "Dedicated onboarding", included: true },
      { text: "Custom data integrations", included: true },
      { text: "Priority SLA support", included: true },
      { text: "White-label option", included: true },
      { text: "NSE/BSE direct feed", included: true },
      { text: "Custom alert rules", included: true },
    ],
  },
];

const tableFeatures = [
  { label: "Dashboards per day",        starter: "5",        pro: "Unlimited",  institutional: "Unlimited" },
  { label: "Broker connections",        starter: "1",        pro: "3",          institutional: "Unlimited" },
  { label: "FII/DII flow tracker",      starter: true,       pro: true,         institutional: true },
  { label: "Stress test scenarios",     starter: "3",        pro: "500+",       institutional: "Unlimited" },
  { label: "Live Options Greeks",       starter: false,      pro: true,         institutional: true },
  { label: "Smart risk alerts",         starter: false,      pro: true,         institutional: true },
  { label: "Dashboard history",         starter: "7 days",   pro: "90 days",    institutional: "Unlimited" },
  { label: "Sector rotation map",       starter: false,      pro: true,         institutional: true },
  { label: "Options chain intelligence",starter: false,      pro: true,         institutional: true },
  { label: "API access",                starter: false,      pro: false,        institutional: true },
  { label: "Team accounts",             starter: false,      pro: false,        institutional: "Up to 10" },
];

const faqs = [
  {
    q: "When does paid pricing start?",
    a: "QuantPilot is free during the beta period. When we launch paid plans, early beta users get founder pricing — guaranteed lower rates locked in permanently.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. No contracts, no cancellation fees. Cancel from your account settings at any time. You keep access until the end of your billing period.",
  },
  {
    q: "Which brokers are supported?",
    a: "Currently Zerodha, ICICI Direct, and Angel One. We're actively adding Upstox, Kotak Securities, Sharekhan, and more. Institutional plans get custom integrations.",
  },
  {
    q: "Is my trading data secure?",
    a: "Yes. We use read-only API connections — we never store your login credentials or have the ability to place trades. Data is encrypted at rest and in transit.",
  },
  {
    q: "What counts as a 'dashboard'?",
    a: "Each time you ask a question and a new dashboard is built, that counts as one dashboard. Viewing or refreshing an existing dashboard does not count toward your limit.",
  },
  {
    q: "Do you offer a free trial of Pro?",
    a: "During beta, you get full Pro-level access for free. After launch, we'll offer a 14-day free trial of Pro for all Starter users.",
  },
];

function CheckIcon({ color = "#2563EB" }: { color?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="flex-shrink-0">
      <circle cx="8" cy="8" r="7.5" fill={color} fillOpacity="0.1" stroke={color} strokeOpacity="0.3" />
      <path d="M5 8l2 2 4-4" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="flex-shrink-0">
      <circle cx="8" cy="8" r="7.5" fill="#F3F4F6" stroke="#E5E7EB" />
      <path d="M10 6l-4 4M6 6l4 4" stroke="#D1D5DB" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function TableCell({ val }: { val: string | boolean }) {
  if (val === true) return <div className="flex justify-center"><CheckIcon color="#2563EB" /></div>;
  if (val === false) return <div className="flex justify-center"><XIcon /></div>;
  return <p className="text-[12.5px] text-[#374151] font-medium text-center">{val}</p>;
}

export default function PricingPage() {
  const [annual, setAnnual] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="py-16 sm:py-24 text-center px-4 sm:px-6">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold mb-6"
            style={{ background: "#F0FDF4", color: "#16A34A", border: "1px solid #BBF7D0" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse inline-block" />
            Beta Pricing — Founder rates locked in forever
          </span>
        </motion.div>

        <motion.h1
          className="text-[2.5rem] sm:text-5xl font-bold text-[#111827] tracking-tight leading-[1.1] mb-4 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.08, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}>
          Simple, transparent pricing.
        </motion.h1>

        <motion.p className="text-[15.5px] text-[#6B7280] mb-8 max-w-md mx-auto"
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.16 }}>
          Start free. Upgrade when you need more. Cancel anytime.
        </motion.p>

        {/* Toggle */}
        <motion.div className="inline-flex items-center gap-3 p-1 rounded-xl mb-12"
          style={{ background: "#F8FAFC", border: "1px solid #E5E7EB" }}
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.24 }}>
          <button
            onClick={() => setAnnual(false)}
            className="px-4 py-2 rounded-lg text-[13px] font-semibold transition-all duration-200"
            style={!annual ? { background: "white", color: "#111827", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" } : { color: "#6B7280" }}>
            Monthly
          </button>
          <button
            onClick={() => setAnnual(true)}
            className="px-4 py-2 rounded-lg text-[13px] font-semibold transition-all duration-200 flex items-center gap-2"
            style={annual ? { background: "white", color: "#111827", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" } : { color: "#6B7280" }}>
            Annual
            <span className="px-1.5 py-0.5 rounded-full text-[9.5px] font-bold"
              style={{ background: "#DCFCE7", color: "#16A34A" }}>
              Save 20%
            </span>
          </button>
        </motion.div>

        {/* Plan cards */}
        <div className="grid md:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div key={plan.name}
              className="p-6 rounded-2xl text-left relative"
              style={{
                background: "white",
                border: plan.highlight ? "2px solid #2563EB" : "1px solid #E5E7EB",
                boxShadow: plan.highlight ? "0 8px 40px rgba(37,99,235,0.12)" : "none",
              }}
              {...fade(i * 0.1)}>
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-3 py-1 rounded-full text-[10.5px] font-bold text-white"
                    style={{ background: "#2563EB" }}>
                    {plan.badge}
                  </span>
                </div>
              )}

              <p className="text-[13px] font-semibold text-[#6B7280] mb-1 mt-2">{plan.name}</p>
              <p className="text-[12px] text-[#9CA3AF] mb-4 leading-relaxed">{plan.desc}</p>

              <div className="flex items-baseline gap-1 mb-5 h-10">
                <AnimatePresence mode="wait">
                  <motion.span key={annual ? "annual" : "monthly"}
                    initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.18 }}
                    className="text-[2.2rem] font-black text-[#111827]">
                    {annual ? plan.annual : plan.monthly}
                  </motion.span>
                </AnimatePresence>
                <span className="text-[13px] text-[#9CA3AF]">
                  {annual ? plan.annualSub : plan.monthlySub}
                </span>
              </div>

              <a href={plan.ctaHref}
                className="block text-center py-2.5 rounded-xl text-[13.5px] font-semibold mb-5 transition-all"
                style={plan.highlight
                  ? { background: "linear-gradient(135deg, #2563EB, #60A5FA)", color: "white", boxShadow: "0 4px 14px rgba(37,99,235,0.25)" }
                  : { background: "#F8FAFC", color: "#374151", border: "1px solid #E5E7EB" }}>
                {plan.cta}
              </a>

              <ul className="space-y-2.5">
                {plan.features.map(f => (
                  <li key={f.text} className="flex items-center gap-2.5 text-[12.5px]"
                    style={{ color: f.included ? "#374151" : "#C4C9D1" }}>
                    {f.included
                      ? <CheckIcon color={plan.highlight ? "#2563EB" : "#6B7280"} />
                      : <XIcon />}
                    {f.text}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Comparison table — desktop only */}
      <section className="hidden md:block py-16 border-t border-[#E5E7EB]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <motion.h2 className="text-2xl font-bold text-[#111827] mb-8 tracking-tight text-center" {...fade(0)}>
            Full feature comparison
          </motion.h2>
          <motion.div className="rounded-2xl overflow-hidden" style={{ border: "1px solid #E5E7EB" }} {...fade(0.08)}>
            <table className="w-full">
              <thead>
                <tr style={{ background: "#F8FAFC", borderBottom: "1px solid #E5E7EB" }}>
                  <th className="text-left px-5 py-3.5 text-[12px] font-semibold text-[#6B7280] w-[40%]">Feature</th>
                  {["Starter", "Pro", "Institutional"].map(n => (
                    <th key={n} className={`text-center px-5 py-3.5 text-[12px] font-semibold ${n === "Pro" ? "text-[#2563EB]" : "text-[#6B7280]"}`}>
                      {n}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableFeatures.map((row, i) => (
                  <tr key={row.label}
                    style={{ background: i % 2 === 0 ? "white" : "#FAFBFF", borderBottom: "1px solid #F3F4F6" }}>
                    <td className="px-5 py-3 text-[12.5px] text-[#374151] font-medium">{row.label}</td>
                    <td className="px-5 py-3"><TableCell val={row.starter} /></td>
                    <td className="px-5 py-3" style={{ background: "rgba(37,99,235,0.02)" }}>
                      <TableCell val={row.pro} />
                    </td>
                    <td className="px-5 py-3"><TableCell val={row.institutional} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 border-t border-[#E5E7EB]" style={{ background: "#FAFBFF" }}>
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <motion.h2 className="text-2xl font-bold text-[#111827] mb-8 tracking-tight text-center" {...fade(0)}>
            Frequently asked questions
          </motion.h2>
          <div className="space-y-2">
            {faqs.map((faq, i) => (
              <motion.div key={faq.q}
                className="rounded-2xl overflow-hidden"
                style={{ background: "white", border: "1px solid #E5E7EB" }}
                {...fade(i * 0.06)}>
                <button
                  className="w-full flex items-center justify-between px-5 py-4 text-left"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <span className="text-[14px] font-semibold text-[#111827] pr-4">{faq.q}</span>
                  <motion.svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="flex-shrink-0"
                    animate={{ rotate: openFaq === i ? 180 : 0 }}
                    transition={{ duration: 0.2 }}>
                    <path d="M4 6l4 4 4-4" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </motion.svg>
                </button>
                <AnimatePresence initial={false}>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                      style={{ overflow: "hidden" }}>
                      <p className="px-5 pb-4 text-[13.5px] text-[#6B7280] leading-relaxed">{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20" style={{ background: "#111827" }}>
        <div className="max-w-xl mx-auto px-4 sm:px-6 text-center">
          <motion.div {...fade(0)}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6"
              style={{ background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.25)" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse inline-block" />
              <span className="text-[11px] font-semibold text-[#22C55E]">340+ traders on the waitlist — spots limited</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 tracking-tight">
              Join the beta before slots fill up.
            </h2>
            <p className="text-[14px] text-[#9CA3AF] mb-7 leading-relaxed">
              Beta users get full Pro access for free. When paid plans launch, your founder pricing is locked in — no matter what plans cost later.
            </p>
            <a href="/request-access"
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl text-[14.5px] font-semibold text-[#111827] bg-white hover:bg-[#F8FAFC] transition-colors mb-4"
              style={{ boxShadow: "0 4px 20px rgba(255,255,255,0.1)" }}>
              Get Early Access — It&apos;s Free
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
            <p className="text-[11.5px] text-[#4B5563]">
              No credit card &middot; Cancel anytime &middot;{" "}
              <a href="/schedule-demo" className="hover:text-[#9CA3AF] transition-colors underline">Schedule a demo instead</a>
            </p>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
