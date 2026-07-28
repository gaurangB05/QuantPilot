import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/Navbar";

export default async function WelcomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const name = (user.user_metadata as { full_name?: string })?.full_name;

  return (
    <main className="min-h-screen bg-white">
      <Navbar showAuthLinks={false} />

      <section className="max-w-md mx-auto px-4 sm:px-6 py-20">
        <div
          className="rounded-3xl p-10 flex flex-col items-center text-center"
          style={{ background: "#F8FAFC", border: "1px solid #E5E7EB" }}
        >
          <div className="w-16 h-16 rounded-full bg-[#DCFCE7] flex items-center justify-center mb-5">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <path d="M6 14l5 5L22 8" stroke="#22C55E" strokeWidth="2.5"
                strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <h1 className="text-[1.5rem] font-bold text-[#111827] mb-2">Email confirmed!</h1>
          <p className="text-[13.5px] text-[#6B7280] leading-relaxed mb-7">
            Welcome to QuantPilot{name ? `, ${name}` : ""}. Your account is ready to go.
          </p>

          <a
            href="/dashboard"
            className="w-full py-3 rounded-xl text-[14.5px] font-semibold text-white text-center"
            style={{ background: "linear-gradient(135deg, #2563EB, #60A5FA)", boxShadow: "0 4px 16px rgba(37,99,235,0.28)" }}
          >
            Continue to Dashboard →
          </a>
        </div>
      </section>
    </main>
  );
}
