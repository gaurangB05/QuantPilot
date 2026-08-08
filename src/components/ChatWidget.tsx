"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hi! Ask me anything about your portfolio — holdings, P&L, margins, positions." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;

    setInput("");
    const nextMessages = [...messages, { role: "user" as const, content: text }];
    setMessages(nextMessages);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message: text, history: nextMessages.slice(-10) }),
      });
      const data = await res.json();
      setMessages((m) => [...m, { role: "assistant", content: data.reply ?? "Something went wrong." }]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "Couldn't reach the assistant. Try again." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Portfolio assistant"
        className="fixed bottom-6 right-6 z-[90] w-14 h-14 rounded-full flex items-center justify-center cursor-pointer transition-transform hover:scale-105"
        style={{ background: "linear-gradient(135deg, #2563EB, #60A5FA)", boxShadow: "0 8px 24px rgba(37,99,235,0.35)" }}
      >
        {open ? (
          <svg width="20" height="20" viewBox="0 0 22 22" fill="none">
            <path d="M5 5 L17 17 M17 5 L5 17" stroke="white" strokeWidth="2" strokeLinecap="round" />
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 2 L14.2 9.8 L22 12 L14.2 14.2 L12 22 L9.8 14.2 L2 12 L9.8 9.8 Z"
              fill="white"
            />
            <path
              d="M19 2 L19.9 4.1 L22 5 L19.9 5.9 L19 8 L18.1 5.9 L16 5 L18.1 4.1 Z"
              fill="white"
            />
          </svg>
        )}
      </button>

      {open && (
        <div
          className="fixed bottom-24 right-6 z-[90] w-80 sm:w-96 h-[28rem] rounded-2xl flex flex-col overflow-hidden"
          style={{ background: "white", border: "1px solid #E5E7EB", boxShadow: "0 20px 60px rgba(0,0,0,0.18)" }}
        >
          <div className="px-4 py-3 flex items-center gap-2 flex-shrink-0" style={{ background: "#2563EB" }}>
            <span className="w-2 h-2 rounded-full bg-white/80 animate-pulse" />
            <span className="text-white text-[13px] font-semibold">Portfolio Assistant</span>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-2">
            {messages.map((m, i) => (
              <div
                key={i}
                className="max-w-[85%] px-3 py-2 rounded-xl text-[12.5px] leading-relaxed"
                style={{
                  alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                  background: m.role === "user" ? "#2563EB" : "#F3F4F6",
                  color: m.role === "user" ? "white" : "#111827",
                }}
              >
                {m.content}
              </div>
            ))}
            {loading && (
              <div
                className="px-3 py-2 rounded-xl text-[12.5px]"
                style={{ alignSelf: "flex-start", background: "#F3F4F6", color: "#9CA3AF" }}
              >
                Thinking…
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => { e.preventDefault(); send(); }}
            className="flex items-center gap-2 px-3 py-3 flex-shrink-0"
            style={{ borderTop: "1px solid #E5E7EB" }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your portfolio…"
              className="flex-1 px-3 py-2 rounded-xl text-[12.5px] outline-none"
              style={{ border: "1px solid #E5E7EB" }}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-3 py-2 rounded-xl text-[12.5px] font-medium text-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: "#2563EB" }}
            >
              Send
            </button>
          </form>
        </div>
      )}
    </>
  );
}
