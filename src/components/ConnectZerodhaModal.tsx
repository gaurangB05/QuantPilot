"use client";

import { useState } from "react";

type Stage = "credentials" | "manual" | "connecting" | "error";

export default function ConnectZerodhaModal() {
  const [open, setOpen] = useState(false);
  const [stage, setStage] = useState<Stage>("credentials");
  const [clientId, setClientId] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [connectingMsg, setConnectingMsg] = useState("Connecting your account…");
  const [manualApiKey, setManualApiKey] = useState("");
  const [manualApiSecret, setManualApiSecret] = useState("");

  function reset() {
    setStage("credentials");
    setClientId("");
    setErrorMsg("");
    setManualApiKey("");
    setManualApiSecret("");
  }

  async function submitCredentials(e: React.FormEvent) {
    e.preventDefault();
    const id = clientId.trim().toUpperCase();
    if (!/^[A-Z]{2}[0-9A-Z]{4}$/.test(id)) {
      setErrorMsg("Enter a valid Zerodha Client ID, e.g. AB1234.");
      return;
    }
    setErrorMsg("");
    setConnectingMsg("Setting up your account…");
    setStage("connecting");

    try {
      const res = await fetch("/api/kite-onboard/connect", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ zerodhaClientId: id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Couldn't set up your account.");
      // Real login happens on Zerodha's own site — your password/TOTP never touch us.
      window.location.href = "/api/auth/kite/login";
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
                    We'll automatically set up a personal API connection for your account. You'll then log in
                    directly with Zerodha on their site — your password and TOTP never touch our servers.
                  </p>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12.5px] font-semibold text-[#374151]">Zerodha Client ID</label>
                    <input value={clientId} onChange={(e) => setClientId(e.target.value)}
                      placeholder="e.g. AB1234" className="px-3 py-2.5 rounded-xl text-[14px] outline-none"
                      style={{ border: "1px solid #E5E7EB" }} autoFocus />
                  </div>
                  {errorMsg && <p className="text-[12.5px] text-[#DC2626]">{errorMsg}</p>}
                  <button type="submit" className="w-full py-3 rounded-xl text-[14px] font-semibold text-white cursor-pointer"
                    style={{ background: "#2563EB" }}>
                    Continue
                  </button>
                  <button type="button" onClick={() => { setErrorMsg(""); setStage("manual"); }}
                    className="text-[12px] text-[#6B7280] hover:text-[#111827] cursor-pointer underline text-center">
                    Prefer to create the app yourself? Connect manually instead
                  </button>
                </form>
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
                  <p className="text-[13px] text-[#6B7280]">{connectingMsg}</p>
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
