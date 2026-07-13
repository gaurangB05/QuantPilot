"use client";

import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";

function SocialProof() {
  return (
    <section className="border-y border-[#E5E7EB] bg-[#FAFBFF] py-5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
          {[
            { value: "340+", label: "traders on waitlist" },
            { value: "< 5s", label: "dashboard build time" },
            { value: "3 brokers", label: "integrated" },
            { value: "Free beta", label: "no credit card" },
          ].map((stat, i) => (
            <motion.div key={stat.label} className="text-center"
              initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}>
              <p className="text-[18px] font-bold text-[#111827]">{stat.value}</p>
              <p className="text-[11.5px] text-[#9CA3AF] font-medium mt-0.5">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <HeroSection />
      <SocialProof />
    </main>
  );
}
