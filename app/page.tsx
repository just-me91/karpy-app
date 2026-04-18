"use client";

import { useEffect, useState } from "react";

type User = {
  wallet: string;
  balance: number;
  streak: number;
  miningLevel: number;
};

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState("Loading...");
  const [loading, setLoading] = useState(true);

  async function loadUser() {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();

      if (!data.user) {
        window.location.href = "/auth";
        return;
      }

      setUser(data.user);
      setStatus("Ready");
    } catch {
      setStatus("Failed to load user");
    } finally {
      setLoading(false);
    }
  }

  async function handleClaim() {
    if (!user) return;

    try {
      setStatus("Mining...");

      const res = await fetch("/api/karpy/claim", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          wallet: user.wallet,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus(data.error || "Claim failed");
        return;
      }

      setStatus(`+${data.reward} KPY mined`);

      await loadUser();
    } catch {
      setStatus("Claim error");
    }
  }

  async function buyBoost(type: "x2" | "x3") {
    if (!user) return;

    await fetch("/api/karpy/boost/apply", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        wallet: user.wallet,
        type,
      }),
    });

    setStatus(`Boost ${type} activated`);
    await loadUser();
  }

  async function activatePremium() {
    if (!user) return;

    await fetch("/api/karpy/premium/apply", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        wallet: user.wallet,
      }),
    });

    setStatus("Premium activated");
    await loadUser();
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/auth";
  }

  useEffect(() => {
    loadUser();
  }, []);

  if (loading) {
    return <div style={{ padding: 40, color: "white" }}>Loading...</div>;
  }

  if (!user) return null;

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0b1220",
        color: "white",
        padding: 24,
        fontFamily: "Arial",
      }}
    >
      <h1>KARPY Mining</h1>

      <div style={{ marginBottom: 20 }}>
        <strong>Wallet:</strong> {user.wallet}
      </div>

      <div style={{ marginBottom: 20 }}>
        <strong>Balance:</strong> {user.balance} KPY
      </div>

      <div style={{ marginBottom: 20 }}>
        <strong>Streak:</strong> {user.streak}
      </div>

      <div style={{ marginBottom: 20 }}>
        <strong>Level:</strong> {user.miningLevel}
      </div>

      <button onClick={handleClaim} style={btn}>
        ⛏ Mine KARPY
      </button>

      <h2 style={{ marginTop: 30 }}>Boosts</h2>

      <button onClick={() => buyBoost("x2")} style={btn}>
        ⚡ x2 Mining (24h)
      </button>

      <button onClick={() => buyBoost("x3")} style={btn}>
        🚀 x3 Mining (24h)
      </button>

      <h2 style={{ marginTop: 30 }}>Premium</h2>

      <button onClick={activatePremium} style={btn}>
        💎 Activate Premium
      </button>

      <h2 style={{ marginTop: 30 }}>Account</h2>

      <button onClick={logout} style={btn}>
        Logout
      </button>

      <div style={{ marginTop: 20, color: "#9db2d0" }}>
        Status: {status}
      </div>
    </main>
  );
}

const btn: React.CSSProperties = {
  display: "block",
  marginTop: 10,
  padding: "12px 16px",
  borderRadius: 10,
  border: "none",
  background: "#2563eb",
  color: "white",
  fontWeight: "bold",
  cursor: "pointer",
};