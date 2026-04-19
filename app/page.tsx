"use client";

import { useEffect, useState } from "react";

type SessionUser = {
  wallet: string;
  username?: string | null;
  balance: number;
  streak: number;
  referrals?: number;
  totalMined?: number;
  miningXp?: number;
  miningLevel: number;
  isPremium?: boolean;
};

export default function HomePage() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [status, setStatus] = useState("Loading session...");
  const [loading, setLoading] = useState(true);

  async function loadUser() {
    try {
      setStatus("Checking session...");
      const res = await fetch("/api/auth/me", {
        method: "GET",
        cache: "no-store",
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus(data.error || "Failed to load session");
        setLoading(false);
        return;
      }

      if (!data.user) {
        window.location.href = "/auth";
        return;
      }

      setUser(data.user);
      setStatus("Ready");
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Unknown error";
      setStatus(message);
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

      setStatus(`Mined +${data.reward} KPY`);
      await loadUser();
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Claim error";
      setStatus(message);
    }
  }

  async function logout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/auth";
    } catch {
      setStatus("Logout failed");
    }
  }

  useEffect(() => {
    loadUser();
  }, []);

  if (loading) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background: "#05080f",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Arial, sans-serif",
          fontSize: 24,
        }}
      >
        Loading...
      </main>
    );
  }

  if (!user) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background: "#05080f",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Arial, sans-serif",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <div>No active session</div>
        <a href="/auth" style={{ color: "#60a5fa" }}>
          Go to login
        </a>
        <div style={{ color: "#94a3b8" }}>{status}</div>
      </main>
    );
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
      }}
    >
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <h1 style={{ fontSize: 42, marginBottom: 20 }}>KARPY Dashboard</h1>

        <div
          style={{
            display: "grid",
            gap: 16,
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            marginBottom: 24,
          }}
        >
          <Card label="Wallet" value={user.wallet} />
          <Card label="Username" value={user.username || "-"} />
          <Card label="Balance" value={`${user.balance} KPY`} />
          <Card label="Streak" value={`${user.streak}`} />
          <Card label="Level" value={`${user.miningLevel}`} />
          <Card label="Premium" value={user.isPremium ? "YES" : "NO"} />
        </div>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button onClick={handleClaim} style={btn}>
            Mine KARPY
          </button>

          <button
            onClick={() => {
              window.location.href = "/auth";
            }}
            style={btnSecondary}
          >
            Auth Page
          </button>

          <button onClick={logout} style={btnSecondary}>
            Logout
          </button>
        </div>

        <div
          style={{
            marginTop: 24,
            padding: 16,
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

function Card({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        padding: 18,
        borderRadius: 18,
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <div style={{ color: "#94a3b8", marginBottom: 8 }}>{label}</div>
      <div style={{ fontWeight: 700, fontSize: 18, wordBreak: "break-word" }}>
        {value}
      </div>
    </div>
  );
}

const btn: React.CSSProperties = {
  padding: "12px 18px",
  borderRadius: 12,
  border: "none",
  background: "#2563eb",
  color: "white",
  fontWeight: 700,
  cursor: "pointer",
};

const btnSecondary: React.CSSProperties = {
  padding: "12px 18px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.15)",
  background: "rgba(255,255,255,0.04)",
  color: "white",
  fontWeight: 700,
  cursor: "pointer",
};