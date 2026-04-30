"use client";

import { useEffect, useState } from "react";

type Profile = {
  username?: string | null;
  referralCode: string;
  referrals: number;
  streak: number;
  miningLevel: number;
  totalMined: number;
};

export default function TeamPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [status, setStatus] = useState("");

  useEffect(() => {
    fetch("/api/karpy/profile")
      .then((res) => res.json())
      .then((data) => setProfile(data))
      .catch(() => setStatus("Could not load team profile."));
  }, []);

  async function completeTeamMission() {
    try {
      const res = await fetch("/api/karpy/task/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId: "team_invite_code" }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus(data.error || "Team mission could not be completed.");
        return;
      }
      setStatus(`Team mission complete. +${data.reward} KARPY Points added.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Team mission failed.");
    }
  }

  const inviteLink = typeof window !== "undefined" && profile ? `${window.location.origin}/auth?ref=${profile.referralCode}` : "";

  return (
    <main style={pageWrap}>
      <section style={heroCard}>
        <div style={badge}>Team Hub</div>
        <h1 style={title}>Build your KARPY team</h1>
        <p style={subtitle}>Invite people into the app, but keep it honest: KARPY Points are for in-app progress and rewards.</p>
      </section>

      <section style={contentCard}>
        {!profile ? (
          <p style={subtitle}>Loading...</p>
        ) : (
          <>
            <div style={codeBox}>{profile.referralCode}</div>
            <div style={linkBox}>{inviteLink}</div>
            <div style={statsGrid}>
              <Stat label="Referrals" value={profile.referrals} />
              <Stat label="Streak" value={profile.streak} />
              <Stat label="Level" value={profile.miningLevel} />
              <Stat label="Total mined" value={profile.totalMined} />
            </div>
            <button
              style={primaryButton}
              onClick={async () => {
                await navigator.clipboard.writeText(inviteLink);
                setStatus("Invite link copied.");
              }}
            >
              Copy invite link
            </button>
            <button style={secondaryButton} onClick={completeTeamMission}>Complete Team Hub mission</button>
          </>
        )}
        {status ? <div style={statusBox}>{status}</div> : null}
      </section>

      <section style={contentCard}>
        <h2 style={sectionTitle}>How team rewards should work</h2>
        <p style={paragraph}>The healthy model is not to reward fake signups. Reward activity: first claim, streak, quiz completion and real return visits.</p>
        <p style={paragraph}>This keeps the app closer to Pi/Bee-style growth without promising payouts or creating wallet problems.</p>
      </section>

      <a href="/" style={backLink}>← Back to mining dashboard</a>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div style={statCard}>
      <div style={{ color: "#8fa4c4", fontSize: 13 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 950 }}>{value}</div>
    </div>
  );
}

const pageWrap: React.CSSProperties = { minHeight: "100vh", padding: 24, background: "radial-gradient(circle at top, #1d4ed8 0, #020617 42%, #000 100%)", color: "white" };
const heroCard: React.CSSProperties = { maxWidth: 900, margin: "0 auto 18px", padding: 24, borderRadius: 28, background: "rgba(15,23,42,0.82)", border: "1px solid rgba(147,197,253,0.16)" };
const contentCard: React.CSSProperties = { maxWidth: 900, margin: "0 auto 18px", padding: 22, borderRadius: 24, background: "rgba(15,23,42,0.72)", border: "1px solid rgba(255,255,255,0.08)" };
const badge: React.CSSProperties = { display: "inline-flex", padding: "7px 11px", borderRadius: 999, border: "1px solid rgba(56,189,248,0.5)", color: "#7dd3fc", fontSize: 12, fontWeight: 900, marginBottom: 12 };
const title: React.CSSProperties = { fontSize: 38, lineHeight: 1.05, margin: 0, fontWeight: 950 };
const subtitle: React.CSSProperties = { color: "#bfdbfe", fontSize: 16, lineHeight: 1.7 };
const sectionTitle: React.CSSProperties = { marginTop: 0, fontSize: 22, fontWeight: 900 };
const paragraph: React.CSSProperties = { color: "#dbeafe", fontSize: 17, lineHeight: 1.8 };
const codeBox: React.CSSProperties = { padding: 18, borderRadius: 18, background: "rgba(59,130,246,0.18)", border: "1px solid rgba(147,197,253,0.22)", fontSize: 28, fontWeight: 950, marginBottom: 12, wordBreak: "break-word" };
const linkBox: React.CSSProperties = { padding: 14, borderRadius: 16, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#bfdbfe", marginBottom: 14, wordBreak: "break-word" };
const statsGrid: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 12, marginBottom: 14 };
const statCard: React.CSSProperties = { padding: 16, borderRadius: 18, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" };
const primaryButton: React.CSSProperties = { width: "100%", padding: 15, borderRadius: 16, border: "none", background: "linear-gradient(135deg,#2563eb,#38bdf8)", color: "white", fontWeight: 950, cursor: "pointer", marginBottom: 10 };
const secondaryButton: React.CSSProperties = { width: "100%", padding: 15, borderRadius: 16, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.04)", color: "white", fontWeight: 950, cursor: "pointer" };
const statusBox: React.CSSProperties = { marginTop: 14, padding: 14, borderRadius: 16, background: "rgba(59,130,246,0.12)", border: "1px solid rgba(147,197,253,0.18)", color: "#bfdbfe" };
const backLink: React.CSSProperties = { display: "block", maxWidth: 900, margin: "0 auto", color: "#93c5fd", textDecoration: "none", fontWeight: 900 };
