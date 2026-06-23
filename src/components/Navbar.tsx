"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { siteConfig } from "@/lib/config";

function LogoMark() {
  return (
    <div
      className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
      style={{ background: "#2563EB" }}
    >
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M3 12.5L8 3.5L13 12.5M5.5 9.5H10.5" stroke="white" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className="sticky top-0 z-50 transition-all duration-300"
      style={
        scrolled
          ? { background: "rgba(255,255,255,0.97)", backdropFilter: "blur(20px)", borderBottom: "1px solid #e5e7eb", boxShadow: "0 1px 12px rgba(0,0,0,0.06)" }
          : { background: "rgba(255,255,255,0.85)", backdropFilter: "blur(12px)", borderBottom: "1px solid transparent" }
      }
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <a href="/" className="flex items-center gap-2 shrink-0">
          <LogoMark />
          <span className="text-[#111827] font-semibold text-[17px] tracking-tight">
            Quant<span className="text-[#2563EB]">Pilot</span>
          </span>
        </a>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-0.5">
          {siteConfig.nav.links.map((link) => (
            <a key={link.label} href={link.href}
              className="px-4 py-2 text-sm font-medium text-[#6B7280] hover:text-[#111827] rounded-lg hover:bg-[#F8FAFC] transition-all duration-150">
              {link.label}
            </a>
          ))}
        </div>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-3">
          <a href="/schedule-demo"
            className="px-4 py-2 text-sm font-medium text-[#374151] rounded-lg hover:bg-[#F8FAFC] transition-all duration-150">
            Schedule Demo
          </a>
          <a href="/request-access"
            className="px-4 py-2 text-sm font-semibold text-white rounded-lg transition-all duration-150"
            style={{ background: "linear-gradient(135deg, #2563EB, #60A5FA)", boxShadow: "0 1px 6px rgba(37,99,235,0.28)" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "linear-gradient(135deg, #1D4ED8, #2563EB)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "linear-gradient(135deg, #2563EB, #60A5FA)"; }}
          >
            Request Access
          </a>
        </div>

        {/* Mobile hamburger */}
        <button onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden w-9 h-9 flex flex-col items-center justify-center gap-[5px] rounded-lg hover:bg-[#F8FAFC] transition-colors"
          aria-label="Toggle navigation">
          <motion.span animate={mobileOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }} transition={{ duration: 0.2 }}
            className="block w-5 h-[1.5px] bg-[#374151] rounded-full origin-center" />
          <motion.span animate={mobileOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }} transition={{ duration: 0.15 }}
            className="block w-5 h-[1.5px] bg-[#374151] rounded-full" />
          <motion.span animate={mobileOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }} transition={{ duration: 0.2 }}
            className="block w-5 h-[1.5px] bg-[#374151] rounded-full origin-center" />
        </button>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }}
            className="md:hidden overflow-hidden bg-white border-t border-[#e5e7eb]">
            <div className="px-4 py-4 flex flex-col gap-1">
              {siteConfig.nav.links.map((link) => (
                <a key={link.label} href={link.href} onClick={() => setMobileOpen(false)}
                  className="px-4 py-3 text-sm font-medium text-[#374151] hover:text-[#111827] rounded-xl hover:bg-[#F8FAFC] transition-colors">
                  {link.label}
                </a>
              ))}
              <div className="flex flex-col gap-2 mt-3 pt-3 border-t border-[#e5e7eb]">
                <a href="/schedule-demo" onClick={() => setMobileOpen(false)}
                  className="px-4 py-3 text-sm font-medium text-[#374151] border border-[#e5e7eb] rounded-xl text-center hover:bg-[#F8FAFC] transition-all">
                  Schedule Demo
                </a>
                <a href="/request-access" onClick={() => setMobileOpen(false)}
                  className="px-4 py-3 text-sm font-semibold text-white rounded-xl text-center"
                  style={{ background: "linear-gradient(135deg, #2563EB, #60A5FA)" }}>
                  Request Access
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
