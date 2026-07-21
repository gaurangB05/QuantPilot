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
