"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function ResetPasswordPage() {
  const params = useSearchParams();
  const token = useMemo(() => params.get("token") || "", [params]);

  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("Ready");

  async function handleSubmit() {
    try {
      setStatus("Resetting password...");

      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus(data.error || "Reset failed");
        return;
      }

      setStatus("Password reset successful. You can now log in.");
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Reset failed";
      setStatus(message);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top, #17335d 0%, #0a1220 30%, #05080f 100%)",
        color: "white",
        padding: 24,
        fontFamily: "Arial, sans-serif",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 520,
          borderRadius: 24,
          padding: 28,
          background: "rgba(16,22,34,0.94)",
          border: "1px solid rgba(255,255,255,0.06)",
          boxShadow: "0 20px 50px rgba(0,0,0,0.28)",
        }}
      >
        <h1 style={{ fontSize: 34, marginTop: 0 }}>Reset Password</h1>

        <input
          value={token}
          readOnly
          style={{ ...input, opacity: 0.75 }}
        />

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="New password"
          style={input}
        />

        <button onClick={handleSubmit} style={primaryButton}>
          Set New Password
        </button>

        <div style={statusBox}>Status: {status}</div>

        <div style={{ marginTop: 16 }}>
          <a href="/auth" style={{ color: "#60a5fa" }}>
            Back to login
          </a>
        </div>
      </div>
    </main>
  );
}

const input: React.CSSProperties = {
  width: "100%",
  padding: "14px 14px",
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(7,10,16,0.9)",
  color: "white",
  marginBottom: 12,
  outline: "none",
};

const primaryButton: React.CSSProperties = {
  width: "100%",
  padding: "14px 16px",
  borderRadius: 14,
  border: "none",
  background: "linear-gradient(135deg, #2563eb, #3b82f6)",
  color: "white",
  fontWeight: 800,
  cursor: "pointer",
};

const statusBox: React.CSSProperties = {
  marginTop: 16,
  padding: 14,
  borderRadius: 14,
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  color: "#cbd5e1",
};