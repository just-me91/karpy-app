"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

type SessionUser = {
  id: string;
  wallet: string;
  username?: string | null;
  balance: number;
  streak: number;
  referrals: number;
  totalMined: number;
  miningXp: number;
  miningLevel: number;
  referralCode: string;
  isPremium: boolean;
  premiumExpiresAt?: string | null;
  boostMultiplier?: number;
  boostExpiresAt?: string | null;
};

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-GB").format(value || 0);
}

function formatTime(seconds: number) {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(
    secs
  ).padStart(2, "0")}`;
}

export default function HomePage() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [status, setStatus] = useState("Loading session...");
  const [loading, setLoading] = useState(true);
  const [claimLoading, setClaimLoading] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);

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
    if (!user || claimLoading) return;

    try {
      setClaimLoading(true);
      setStatus("Mining KARPY...");

      const res = await fetch("/api/karpy/claim", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-wallet": user.wallet,
        },
        body: JSON.stringify({}),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus(data.error || "Claim failed");

        if (typeof data.secondsRemaining === "number") {
          setSecondsLeft(data.secondsRemaining);
        }

        return;
      }

      setStatus(`Mining successful: +${data.reward} KPY`);

      if (typeof data.secondsRemaining === "number") {
        setSecondsLeft(data.secondsRemaining);
      } else {
        setSecondsLeft(24 * 60 * 60);
      }

      await loadUser();
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Claim error";
      setStatus(message);
    } finally {
      setClaimLoading(false);
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

  useEffect(() => {
    if (secondsLeft <= 0) return;

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsLeft]);

  const canMine = useMemo(() => !claimLoading && secondsLeft === 0, [claimLoading, secondsLeft]);

  if (loading) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background:
            "radial-gradient(circle at top, #17335d 0%, #0a1220 30%, #05080f 100%)",
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

  if (!user) return null;

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top, #17335d 0%, #0a1220 30%, #05080f 100%)",
        color: "white",
        padding: 24,
        fontFamily: "Inter, Arial, sans-serif",
      }}
    >
      <div style={{ maxWidth: 1240, margin: "0 auto" }}>
        <div
          style={{
            marginBottom: 24,
            padding: 24,
            borderRadius: 28,
            border: "1px solid rgba(120,180,255,0.12)",
            background:
              "linear-gradient(135deg, rgba(22,40,76,0.95), rgba(8,16,30,0.95))",
            boxShadow: "0 30px 80px rgba(0,0,0,0.35)",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(320px, 420px) 1fr",
              gap: 24,
              alignItems: "center",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  width: 280,
                  height: 280,
                  borderRadius: "50%",
                  padding: 12,
                  background:
                    "linear-gradient(145deg, rgba(96,165,250,0.25), rgba(29,78,216,0.1))",
                  boxShadow:
                    "0 0 0 2px rgba(96,165,250,0.14), 0 20px 60px rgba(37,99,235,0.35), inset 0 0 40px rgba(255,255,255,0.04)",
                }}
              >
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: "50%",
                    overflow: "hidden",
                    position: "relative",
                    background: "#0b1220",
                  }}
                >
                  <Image
                    src="/karpy-logo.jpg"
                    alt="KARPY logo"
                    fill
                    sizes="280px"
                    style={{ objectFit: "cover" }}
                    priority
                  />
                </div>
              </div>
            </div>

            <div>
              <div
                style={{
                  display: "inline-block",
                  fontSize: 12,
                  letterSpacing: 1,
                  textTransform: "uppercase",
                  padding: "8px 12px",
                  borderRadius: 999,
                  background: "rgba(59,130,246,0.12)",
                  color: "#93c5fd",
                  border: "1px solid rgba(96,165,250,0.18)",
                  marginBottom: 14,
                }}
              >
                KARPY Official Mining Hub
              </div>

              <h1
                style={{
                  fontSize: 48,
                  lineHeight: 1.05,
                  margin: 0,
                  fontWeight: 900,
                  letterSpacing: -1,
                }}
              >
                Mine KARPY.
                <br />
                Grow the Dragon.
              </h1>

              <p
                style={{
                  color: "#9db2d0",
                  fontSize: 17,
                  maxWidth: 700,
                  marginTop: 14,
                  marginBottom: 20,
                  lineHeight: 1.6,
                }}
              >
                Daily mining, progression and account-based access now work on real
                user sessions without the old test wallet hack.
              </p>

              <div
                style={{
                  display: "flex",
                  gap: 14,
                  flexWrap: "wrap",
                }}
              >
                <MiniPill label="Wallet" value={user.wallet} />
                <MiniPill label="Username" value={user.username || "-"} />
                <MiniPill label="Balance" value={`${formatNumber(user.balance)} KPY`} />
                <MiniPill label="Level" value={`${user.miningLevel}`} />
                <MiniPill label="Premium" value={user.isPremium ? "YES" : "NO"} />
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "360px 1fr",
            gap: 20,
            alignItems: "start",
          }}
        >
          <div style={{ display: "grid", gap: 20 }}>
            <section style={minePanel}>
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    color: "#8fa4c4",
                    fontSize: 13,
                    marginBottom: 10,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                  }}
                >
                  Daily Mining Core
                </div>

                <button
                  onClick={handleClaim}
                  disabled={!canMine}
                  style={{
                    ...mineLogoButton,
                    opacity: canMine ? 1 : 0.72,
                    cursor: canMine ? "pointer" : "not-allowed",
                  }}
                  aria-label="Mine KARPY"
                  title="Mine KARPY"
                >
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      borderRadius: "50%",
                      overflow: "hidden",
                    }}
                  >
                    <Image
                      src="/karpy-logo.jpg"
                      alt="Mine KARPY"
                      fill
                      sizes="240px"
                      style={{ objectFit: "cover" }}
                      priority
                    />
                  </div>

                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      borderRadius: "50%",
                      background:
                        "radial-gradient(circle at center, rgba(255,255,255,0.06) 0%, rgba(0,0,0,0.18) 55%, rgba(0,0,0,0.42) 100%)",
                    }}
                  />

                  <div
                    style={{
                      position: "relative",
                      zIndex: 2,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      textShadow: "0 3px 10px rgba(0,0,0,0.55)",
                    }}
                  >
                    <div style={{ fontSize: 24, fontWeight: 900 }}>
                      {claimLoading ? "MINING..." : secondsLeft > 0 ? "COOLDOWN" : "MINE"}
                    </div>
                    <div style={{ fontSize: 12, marginTop: 6, opacity: 0.95 }}>
                      {secondsLeft > 0 ? formatTime(secondsLeft) : "Tap logo to earn"}
                    </div>
                  </div>
                </button>

                <div
                  style={{
                    marginTop: 16,
                    fontSize: 15,
                    color: "#9fc3ff",
                  }}
                >
                  Current balance: <strong>{formatNumber(user.balance)} KPY</strong>
                </div>
              </div>
            </section>

            <section style={leftCard}>
              <h2 style={sectionTitle}>Account</h2>

              <div style={{ display: "grid", gap: 10 }}>
                <RewardRow label="Wallet" value={user.wallet} />
                <RewardRow label="Username" value={user.username || "-"} />
                <RewardRow label="Referral code" value={user.referralCode || "-"} />
                <RewardRow label="Premium" value={user.isPremium ? "Enabled" : "Disabled"} />
              </div>

              <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
                <button
                  style={secondaryButton}
                  onClick={() => {
                    window.location.href = "/auth";
                  }}
                >
                  Auth Page
                </button>

                <button style={secondaryButton} onClick={logout}>
                  Logout
                </button>
              </div>
            </section>
          </div>

          <div style={{ display: "grid", gap: 20 }}>
            <section style={rightCard}>
              <h2 style={sectionTitle}>Mining Overview</h2>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                  gap: 14,
                }}
              >
                <StatCard label="Balance" value={`${formatNumber(user.balance)}`} accent="#60a5fa" />
                <StatCard label="Total Mined" value={`${formatNumber(user.totalMined)}`} accent="#f59e0b" />
                <StatCard label="Referrals" value={`${formatNumber(user.referrals)}`} accent="#34d399" />
                <StatCard label="Mining XP" value={`${formatNumber(user.miningXp)}`} accent="#22d3ee" />
                <StatCard label="Streak" value={`${formatNumber(user.streak)}`} accent="#a78bfa" />
                <StatCard label="Level" value={`${formatNumber(user.miningLevel)}`} accent="#f472b6" />
              </div>
            </section>

            <section style={rightCard}>
              <h2 style={sectionTitle}>Status</h2>
              <div style={statusBox}>{status}</div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}

function MiniPill({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div
      style={{
        padding: "10px 14px",
        borderRadius: 999,
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <span style={{ color: "#8fa4c4", marginRight: 8 }}>{label}:</span>
      <strong>{value}</strong>
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: 18,
        padding: 18,
      }}
    >
      <div
        style={{
          color: "#8fa4c4",
          fontSize: 13,
          textTransform: "uppercase",
          letterSpacing: 1,
          marginBottom: 10,
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: 30, fontWeight: 900, color: accent }}>{value}</div>
    </div>
  );
}

function RewardRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: 12,
        padding: "12px 14px",
        borderRadius: 14,
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <span style={{ color: "#8fa4c4" }}>{label}</span>
      <strong style={{ textAlign: "right", wordBreak: "break-word" }}>{value}</strong>
    </div>
  );
}

const leftCard: React.CSSProperties = {
  background: "rgba(16,22,34,0.94)",
  border: "1px solid rgba(255,255,255,0.06)",
  borderRadius: 22,
  padding: 20,
  boxShadow: "0 12px 30px rgba(0,0,0,0.22)",
};

const rightCard: React.CSSProperties = {
  background: "rgba(16,22,34,0.94)",
  border: "1px solid rgba(255,255,255,0.06)",
  borderRadius: 22,
  padding: 22,
  boxShadow: "0 12px 30px rgba(0,0,0,0.22)",
};

const minePanel: React.CSSProperties = {
  background:
    "radial-gradient(circle at top, rgba(59,130,246,0.25), rgba(17,24,39,0.98) 60%)",
  border: "1px solid rgba(96,165,250,0.15)",
  borderRadius: 28,
  padding: 24,
  boxShadow: "0 18px 40px rgba(37,99,235,0.22)",
};

const sectionTitle: React.CSSProperties = {
  marginTop: 0,
  marginBottom: 16,
  fontSize: 24,
  fontWeight: 900,
};

const secondaryButton: React.CSSProperties = {
  width: "100%",
  padding: "13px 16px",
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(255,255,255,0.04)",
  color: "white",
  fontWeight: 800,
  cursor: "pointer",
};

const mineLogoButton: React.CSSProperties = {
  width: 240,
  height: 240,
  borderRadius: "50%",
  border: "2px solid rgba(147,197,253,0.22)",
  background: "transparent",
  position: "relative",
  overflow: "hidden",
  cursor: "pointer",
  boxShadow:
    "inset 0 10px 25px rgba(255,255,255,0.08), inset 0 -20px 30px rgba(0,0,0,0.35), 0 22px 50px rgba(37,99,235,0.35), 0 0 40px rgba(59,130,246,0.25)",
};

const statusBox: React.CSSProperties = {
  padding: 16,
  borderRadius: 16,
  background: "rgba(59,130,246,0.08)",
  border: "1px solid rgba(59,130,246,0.16)",
  color: "#bfdbfe",
  minHeight: 80,
  display: "flex",
  alignItems: "center",
};