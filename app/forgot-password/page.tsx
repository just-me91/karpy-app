"use client";

import { useState } from "react";

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [loginUsername, setLoginUsername] = useState("");
  const [registerUsername, setRegisterUsername] = useState("");
  const [password, setPassword] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [status, setStatus] = useState("Ready");

  async function handleRegister() {
    try {
      setStatus("Creating account...");

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: registerUsername,
          password: registerPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus(data.error || "Register failed");
        return;
      }

      setStatus("Account created successfully");
      window.location.href = "/";
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Register failed";
      setStatus(message);
    }
  }

  async function handleLogin() {
    try {
      setStatus("Logging in...");

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: loginUsername,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus(data.error || "Login failed");
        return;
      }

      setStatus("Login successful");
      window.location.href = "/";
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Login failed";
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
          maxWidth: 560,
          borderRadius: 24,
          padding: 28,
          background: "rgba(16,22,34,0.94)",
          border: "1px solid rgba(255,255,255,0.06)",
          boxShadow: "0 20px 50px rgba(0,0,0,0.28)",
        }}
      >
        <h1 style={{ fontSize: 36, marginTop: 0, marginBottom: 20 }}>
          KARPY Auth
        </h1>

        <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
          <button onClick={() => setMode("login")} style={tab(mode === "login")}>
            Login
          </button>
          <button onClick={() => setMode("register")} style={tab(mode === "register")}>
            Register
          </button>
        </div>

        {mode === "login" ? (
          <>
            <input
              value={loginUsername}
              onChange={(e) => setLoginUsername(e.target.value)}
              placeholder="Username"
              style={input}
            />

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              style={input}
            />

            <button onClick={handleLogin} style={primaryButton}>
              Login
            </button>
          </>
        ) : (
          <>
            <input
              value={registerUsername}
              onChange={(e) => setRegisterUsername(e.target.value)}
              placeholder="Username"
              style={input}
            />

            <input
              type="password"
              value={registerPassword}
              onChange={(e) => setRegisterPassword(e.target.value)}
              placeholder="Password"
              style={input}
            />

            <button onClick={handleRegister} style={primaryButton}>
              Create Account
            </button>
          </>
        )}

        <div
          style={{
            marginTop: 16,
            padding: 14,
            borderRadius: 14,
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            color: "#cbd5e1",
          }}
        >
          Status: {status}
        </div>
      </div>
    </main>
  );
}

function tab(active: boolean): React.CSSProperties {
  return {
    padding: "10px 14px",
    borderRadius: 999,
    border: active
      ? "1px solid rgba(96,165,250,0.35)"
      : "1px solid rgba(255,255,255,0.08)",
    background: active ? "rgba(59,130,246,0.18)" : "rgba(255,255,255,0.04)",
    color: "white",
    fontWeight: 700,
    cursor: "pointer",
  };
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