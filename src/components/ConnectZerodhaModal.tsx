"use client";

import { useRef, useState } from "react";

type Stage = "credentials" | "totp" | "manual" | "connecting" | "error";

function OtpBoxes({ value, onChange, onComplete }: {
  value: string;
  onChange: (v: string) => void;
  onComplete: () => void;
}) {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.split("");

  function setDigit(index: number, digit: string) {
    const clean = digit.replace(/\D/g, "").slice(-1);
    const next = value.split("");
    next[index] = clean;
    const joined = next.join("").slice(0, 6);
    onChange(joined);

    if (clean && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
    if (joined.length === 6 && next.every((d) => d)) {
      onComplete();
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    onChange(pasted);
    inputsRef.current[Math.min(pasted.length, 5)]?.focus();
    if (pasted.length === 6) onComplete();
  }

  return (
    <div className="flex items-center justify-center gap-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          ref={(el) => { inputsRef.current[i] = el; }}
          value={digits[i] ?? ""}
          onChange={(e) => setDigit(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          inputMode="numeric"
          maxLength={1}
          autoFocus={i === 0}
          className="w-11 h-12 text-center text-[18px] font-semibold rounded-xl outline-none"
          style={{ border: "1px solid #E5E7EB" }}
        />
      ))}
    </div>
  );
}

export default function ConnectZerodhaModal() {
  const [open, setOpen] = useState(false);
  const [stage, setStage] = useState<Stage>("credentials");
  const [clientId, setClientId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [totpCode, setTotpCode] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [manualApiKey, setManualApiKey] = useState("");
  const [manualApiSecret, setManualApiSecret] = useState("");

  function reset() {
    setStage("credentials");
    setClientId("");
    setPassword("");
    setTotpCode("");
    setErrorMsg("");
    setManualApiKey("");
    setManualApiSecret("");
  }

  function submitCredentials(e: React.FormEvent) {
    e.preventDefault();
    const id = clientId.trim().toUpperCase();
    if (!/^[A-Z]{2}[0-9A-Z]{4}$/.test(id)) {
      setErrorMsg("Enter a valid Zerodha Client ID, e.g. AB1234.");
      return;
    }
    if (!password) {
      setErrorMsg("Password is required.");
      return;
    }
    setErrorMsg("");
    setClientId(id);
    setStage("totp");
  }

  async function connectWithCode(code: string) {
    if (!/^\d{6}$/.test(code)) {
      setErrorMsg("Enter the current 6-digit code from your authenticator app.");
      return;
    }
    setErrorMsg("");
    setStage("connecting");

    try {
      const res = await fetch("/api/kite-onboard/connect", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ zerodhaClientId: clientId, password, totpCode: code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Couldn't connect your account.");
      window.location.reload();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
      setStage("error");
    }
  }

  async function submitManual(e: React.FormEvent) {
    e.preventDefault();
    if (!manualApiKey.trim() || !manualApiSecret.trim()) {
      setErrorMsg("Enter both the API key and secret.");
      return;
    }
    setStage("connecting");
    try {
      const res = await fetch("/api/kite-onboard/manual", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ apiKey: manualApiKey.trim(), apiSecret: manualApiSecret.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Couldn't save your API credentials.");
      window.location.href = "/api/auth/kite/login";
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
      setStage("error");
    }
  }

  return (
    <>
      <button
        onClick={() => { reset(); setOpen(true); }}
        className="w-full py-3 rounded-xl text-[14px] font-semibold text-white cursor-pointer"
        style={{ background: "linear-gradient(135deg, #2563EB, #60A5FA)", boxShadow: "0 4px 16px rgba(37,99,235,0.28)" }}
      >
        Connect Zerodha →
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4" style={{ background: "rgba(17,24,39,0.5)" }}>
          <div className="w-full max-w-md rounded-2xl overflow-hidden" style={{ background: "white" }}>
            <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid #E5E7EB" }}>
              <h3 className="text-[15px] font-semibold text-[#111827]">Connect your Zerodha account</h3>
              <button onClick={() => setOpen(false)} aria-label="Close" className="cursor-pointer text-[#9CA3AF] hover:text-[#111827]">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <div className="p-5">
              {stage === "credentials" && (
                <form onSubmit={submitCredentials} className="flex flex-col gap-4">
                  <p className="text-[13px] text-[#6B7280] leading-relaxed">
                    We'll automatically set up a personal API connection using your Zerodha credentials.
                    Nothing is stored — used once to connect, then discarded.
                  </p>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12.5px] font-semibold text-[#374151]">Zerodha Client ID</label>
                    <input value={clientId} onChange={(e) => setClientId(e.target.value)}
                      placeholder="e.g. AB1234" className="px-3 py-2.5 rounded-xl text-[14px] outline-none"
                      style={{ border: "1px solid #E5E7EB" }} autoFocus />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12.5px] font-semibold text-[#374151]">Zerodha Password</label>
                    <div className="relative">
                      <input value={password} onChange={(e) => setPassword(e.target.value)}
                        type={showPassword ? "text" : "password"}
                        className="w-full px-3 py-2.5 pr-10 rounded-xl text-[14px] outline-none"
                        style={{ border: "1px solid #E5E7EB" }} />
                      <button type="button" onClick={() => setShowPassword((s) => !s)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-[#9CA3AF] hover:text-[#374151]">
                        {showPassword ? (
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M1.5 8s2.5-5 6.5-5 6.5 5 6.5 5-2.5 5-6.5 5-6.5-5-6.5-5Z" stroke="currentColor" strokeWidth="1.4" />
                            <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.4" />
                          </svg>
                        ) : (
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M1.5 8s2.5-5 6.5-5 6.5 5 6.5 5-2.5 5-6.5 5-6.5-5-6.5-5Z" stroke="currentColor" strokeWidth="1.4" />
                            <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.4" />
                            <path d="M2 2l12 12" stroke="currentColor" strokeWidth="1.4" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                  {errorMsg && <p className="text-[12.5px] text-[#DC2626]">{errorMsg}</p>}
                  <button type="submit" className="w-full py-3 rounded-xl text-[14px] font-semibold text-white cursor-pointer"
                    style={{ background: "#2563EB" }}>
                    Continue
                  </button>
                  <button type="button" onClick={() => { setErrorMsg(""); setStage("manual"); }}
                    className="text-[12px] text-[#6B7280] hover:text-[#111827] cursor-pointer underline text-center">
                    Prefer not to share your password? Connect manually instead
                  </button>
                </form>
              )}

              {stage === "totp" && (
                <div className="flex flex-col gap-4">
                  <p className="text-[13px] text-[#6B7280] leading-relaxed text-center">
                    Enter the current 6-digit code from your authenticator app.
                    It expires in ~30s, so type it fresh, right now.
                  </p>
                  <OtpBoxes value={totpCode} onChange={setTotpCode} onComplete={() => connectWithCode(totpCode)} />
                  {errorMsg && <p className="text-[12.5px] text-[#DC2626] text-center">{errorMsg}</p>}
                  <button onClick={() => connectWithCode(totpCode)}
                    className="w-full py-3 rounded-xl text-[14px] font-semibold text-white cursor-pointer"
                    style={{ background: "#2563EB" }}>
                    Connect
                  </button>
                  <button type="button" onClick={() => { setErrorMsg(""); setStage("credentials"); }}
                    className="text-[12px] text-[#6B7280] hover:text-[#111827] cursor-pointer underline text-center">
                    ← Back
                  </button>
                </div>
              )}

              {stage === "manual" && (
                <form onSubmit={submitManual} className="flex flex-col gap-4">
                  <p className="text-[13px] text-[#6B7280] leading-relaxed">
                    Create a free <strong>Personal</strong> app yourself at{" "}
                    <a href="https://developers.kite.trade/create" target="_blank" rel="noopener noreferrer"
                      className="text-[#2563EB] underline">developers.kite.trade/create</a>{" "}
                    (Redirect URL: <code className="text-[11.5px]">https://tradeos-eta.vercel.app/api/auth/kite/callback</code>),
                    then paste the API Key and Secret it gives you below.
                  </p>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12.5px] font-semibold text-[#374151]">API Key</label>
                    <input value={manualApiKey} onChange={(e) => setManualApiKey(e.target.value)}
                      className="px-3 py-2.5 rounded-xl text-[14px] outline-none" style={{ border: "1px solid #E5E7EB" }} autoFocus />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12.5px] font-semibold text-[#374151]">API Secret</label>
                    <input value={manualApiSecret} onChange={(e) => setManualApiSecret(e.target.value)} type="password"
                      className="px-3 py-2.5 rounded-xl text-[14px] outline-none" style={{ border: "1px solid #E5E7EB" }} />
                  </div>
                  {errorMsg && <p className="text-[12.5px] text-[#DC2626]">{errorMsg}</p>}
                  <button type="submit" className="w-full py-3 rounded-xl text-[14px] font-semibold text-white cursor-pointer"
                    style={{ background: "#2563EB" }}>
                    Save & Connect
                  </button>
                </form>
              )}

              {stage === "connecting" && (
                <div className="flex flex-col items-center justify-center py-10 gap-3">
                  <div className="w-6 h-6 rounded-full border-2 animate-spin" style={{ borderColor: "#E5E7EB", borderTopColor: "#2563EB" }} />
                  <p className="text-[13px] text-[#6B7280]">Connecting your account…</p>
                </div>
              )}

              {stage === "error" && (
                <div className="flex flex-col gap-4">
                  <p className="text-[12.5px] text-[#DC2626] px-3 py-2 rounded-lg" style={{ background: "#FEF2F2", border: "1px solid #FECACA" }}>
                    {errorMsg}
                  </p>
                  <button onClick={reset} className="w-full py-3 rounded-xl text-[14px] font-semibold text-white cursor-pointer"
                    style={{ background: "#2563EB" }}>
                    Try again
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
