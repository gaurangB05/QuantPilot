"use client";

import { useFormStatus } from "react-dom";

export default function SubmitButton({
  children,
  pendingText,
  className,
  style,
}: {
  children: React.ReactNode;
  pendingText: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={className}
      style={{ ...style, ...(pending ? { opacity: 0.7, cursor: "not-allowed" } : {}) }}
    >
      {pending ? pendingText : children}
    </button>
  );
}

export function PendingOverlay({ text }: { text: string }) {
  const { pending } = useFormStatus();
  if (!pending) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{ background: "rgba(17,24,39,0.35)" }}
    >
      <div
        className="rounded-2xl px-8 py-6 flex flex-col items-center gap-3"
        style={{ background: "white", border: "1px solid #E5E7EB", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}
      >
        <div
          className="w-6 h-6 rounded-full border-2 animate-spin"
          style={{ borderColor: "#E5E7EB", borderTopColor: "#2563EB" }}
        />
        <p className="text-[13.5px] font-medium text-[#111827]">{text}</p>
      </div>
    </div>
  );
}
