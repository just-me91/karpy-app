"use client";

import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

const PAIRS = ["Wallet", "Gas", "Block", "Node"];

export default function GamesPage() {
  const params = useSearchParams();
  const mission = params.get("mission") || "tap";
  const [taps, setTaps] = useState(0);
  const [selected, setSelected] = useState<number[]>([]);
  const [matched, setMatched] = useState<string[]>([]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const cards = useMemo(() => [...PAIRS, ...PAIRS].map((label, index) => ({ id: index, label })), []);
  const isMemory = mission === "memory";
  const taskId = isMemory ? "game_memory" : "game_tap_reactor";
  const reward = isMemory ? 220 : 130;
  const complete = isMemory ? matched.length === PAIRS.length : taps >= 25;

  function pickCard(index: number) {
    if (!isMemory) return;
    if (selected.includes(index)) return;
    if (matched.includes(cards[index].label)) return;

    const next = [...selected, index];
    setSelected(next);

    if (next.length === 2) {
      const [a, b] = next;
      if (cards[a].label === cards[b].label) {
        setMatched((prev) => [...prev, cards[a].label]);
      }
      setTimeout(() => setSelected([]), 500);
    }
  }

  async function claimReward() {
    if (!complete) {
      setStatus("Finish the game first.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/karpy/task/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus(data.error || "Game reward could not be saved.");
        return;
      }
      setStatus(`Game complete. +${data.reward} KARPY Points added.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Game failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={pageWrap}>
      <section style={heroCard}>
        <div style={badge}>Mini Game</div>
        <h1 style={title}>{isMemory ? "Crypto Memory Match" : "Tap Reactor"}</h1>
        <p style={subtitle}>Play a small activity before receiving the reward. This feels better than empty click tasks.</p>
      </section>

      <section style={contentCard}>
        {isMemory ? (
          <>
            <div style={grid}>
              {cards.map((card, index) => {
                const visible = selected.includes(index) || matched.includes(card.label);
                return (
                  <button key={card.id} onClick={() => pickCard(index)} style={cardButton}>
                    {visible ? card.label : "?"}
                  </button>
                );
              })}
            </div>
            <div style={scoreBox}>Matched: {matched.length}/{PAIRS.length}</div>
          </>
        ) : (
          <>
            <button onClick={() => setTaps((v) => v + 1)} style={tapButton}>⚡ Tap Reactor</button>
            <div style={scoreBox}>Charge: {Math.min(100, Math.floor((taps / 25) * 100))}%</div>
          </>
        )}

        <button disabled={!complete || loading} onClick={claimReward} style={{ ...primaryButton, opacity: !complete || loading ? 0.6 : 1 }}>
          {loading ? "Saving..." : `Claim +${reward} KARPY Points`}
        </button>
        {status ? <div style={statusBox}>{status}</div> : null}
      </section>

      <section style={contentCard}>
        <h2 style={sectionTitle}>More games</h2>
        <div style={{ display: "grid", gap: 10 }}>
          <a href="/games?mission=tap" style={linkCard}>Tap Reactor</a>
          <a href="/games?mission=memory" style={linkCard}>Crypto Memory Match</a>
        </div>
      </section>

      <a href="/" style={backLink}>← Back to mining dashboard</a>
    </main>
  );
}

const pageWrap: React.CSSProperties = { minHeight: "100vh", padding: 24, background: "radial-gradient(circle at top, #1d4ed8 0, #020617 42%, #000 100%)", color: "white" };
const heroCard: React.CSSProperties = { maxWidth: 900, margin: "0 auto 18px", padding: 24, borderRadius: 28, background: "rgba(15,23,42,0.82)", border: "1px solid rgba(147,197,253,0.16)" };
const contentCard: React.CSSProperties = { maxWidth: 900, margin: "0 auto 18px", padding: 22, borderRadius: 24, background: "rgba(15,23,42,0.72)", border: "1px solid rgba(255,255,255,0.08)" };
const badge: React.CSSProperties = { display: "inline-flex", padding: "7px 11px", borderRadius: 999, border: "1px solid rgba(56,189,248,0.5)", color: "#7dd3fc", fontSize: 12, fontWeight: 900, marginBottom: 12 };
const title: React.CSSProperties = { fontSize: 38, lineHeight: 1.05, margin: 0, fontWeight: 950 };
const subtitle: React.CSSProperties = { color: "#bfdbfe", fontSize: 16, lineHeight: 1.7 };
const sectionTitle: React.CSSProperties = { marginTop: 0, fontSize: 22, fontWeight: 900 };
const grid: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 10 };
const cardButton: React.CSSProperties = { minHeight: 84, borderRadius: 18, border: "1px solid rgba(147,197,253,0.22)", background: "rgba(59,130,246,0.16)", color: "white", fontWeight: 950, cursor: "pointer" };
const tapButton: React.CSSProperties = { width: "100%", minHeight: 180, borderRadius: 28, border: "1px solid rgba(147,197,253,0.25)", background: "radial-gradient(circle,#38bdf8,#2563eb 55%,#1e3a8a)", color: "white", fontSize: 32, fontWeight: 950, cursor: "pointer", boxShadow: "0 26px 80px rgba(37,99,235,0.35)" };
const scoreBox: React.CSSProperties = { marginTop: 14, padding: 14, borderRadius: 16, background: "rgba(59,130,246,0.12)", border: "1px solid rgba(147,197,253,0.18)", color: "#bfdbfe", fontWeight: 900 };
const primaryButton: React.CSSProperties = { width: "100%", marginTop: 16, padding: 15, borderRadius: 16, border: "none", background: "linear-gradient(135deg,#2563eb,#38bdf8)", color: "white", fontWeight: 950, cursor: "pointer" };
const statusBox: React.CSSProperties = { marginTop: 14, padding: 14, borderRadius: 16, background: "rgba(59,130,246,0.12)", border: "1px solid rgba(147,197,253,0.18)", color: "#bfdbfe" };
const linkCard: React.CSSProperties = { display: "block", padding: 14, borderRadius: 16, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "white", textDecoration: "none", fontWeight: 800 };
const backLink: React.CSSProperties = { display: "block", maxWidth: 900, margin: "0 auto", color: "#93c5fd", textDecoration: "none", fontWeight: 900 };
