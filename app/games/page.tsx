"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

const GAMES: Record<string, { title: string; taskId: string; reward: number; description: string }> = {
  tap_reactor: {
    title: "Tap Reactor",
    taskId: "game_tap_reactor",
    reward: 120,
    description: "Tap 12 times to charge the KARPY reactor and complete the mission.",
  },
  memory_match: {
    title: "Memory Match",
    taskId: "game_memory_match",
    reward: 160,
    description: "Flip all concept cards and remember the meaning behind each one.",
  },
  risk_choice: {
    title: "Risk Choice",
    taskId: "game_risk_choice",
    reward: 150,
    description: "Pick the safer choices and learn why risk management matters.",
  },
};

function GamesContent() {
  const searchParams = useSearchParams();
  const mission = searchParams.get("mission") || "tap_reactor";
  const game = useMemo(() => GAMES[mission] || GAMES.tap_reactor, [mission]);

  const [tapScore, setTapScore] = useState(0);
  const [memoryCards, setMemoryCards] = useState<string[]>([]);
  const [riskChoices, setRiskChoices] = useState<Record<number, string>>({});
  const [claimed, setClaimed] = useState(false);
  const [error, setError] = useState("");

  const memoryItems = ["Wallet", "Seed", "Gas", "DYOR", "Risk", "Chain"];
  const riskItems = [
    { label: "Check the official link", safe: true },
    { label: "Share seed phrase with admin", safe: false },
    { label: "Test with small amount", safe: true },
  ];

  const complete =
    mission === "memory_match"
      ? memoryCards.length === memoryItems.length
      : mission === "risk_choice"
        ? Object.keys(riskChoices).length === riskItems.length && Object.values(riskChoices).every((x) => x === "safe")
        : tapScore >= 12;

  async function claimReward() {
    if (!complete || claimed) return;
    setError("");
    const res = await fetch("/api/karpy/task/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskId: game.taskId }),
    });
    if (res.ok) {
      setClaimed(true);
      return;
    }
    const data = await res.json().catch(() => null);
    setError(data?.error || "Reward already claimed or unavailable.");
  }

  return (
    <main className="min-h-screen bg-[#061123] px-4 py-8 text-white">
      <div className="mx-auto max-w-5xl">
        <a href="/" className="text-blue-300 hover:text-blue-200">← Back to KARPY</a>
        <section className="mt-6 rounded-3xl border border-blue-400/20 bg-gradient-to-br from-[#0e1b33] to-[#071426] p-6 shadow-2xl">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-blue-300">KARPY Mini Game</p>
          <h1 className="mt-3 text-4xl font-black">{game.title}</h1>
          <p className="mt-3 text-blue-100">{game.description}</p>
          <p className="mt-4 rounded-2xl bg-blue-500/10 p-4 text-blue-100">Reward: <b>{game.reward} KARPY Points</b></p>
        </section>

        {mission === "memory_match" ? (
          <section className="mt-6 rounded-3xl border border-blue-400/20 bg-[#0d1a2f] p-6">
            <h2 className="text-2xl font-black">Flip the cards</h2>
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {memoryItems.map((item) => {
                const active = memoryCards.includes(item);
                return (
                  <button
                    key={item}
                    onClick={() => setMemoryCards((prev) => (prev.includes(item) ? prev : [...prev, item]))}
                    className={`rounded-3xl border p-6 text-center text-xl font-black ${active ? "border-emerald-300 bg-emerald-500/20" : "border-blue-400/20 bg-blue-950/50 hover:bg-blue-900"}`}
                  >
                    {active ? item : "?"}
                  </button>
                );
              })}
            </div>
          </section>
        ) : mission === "risk_choice" ? (
          <section className="mt-6 rounded-3xl border border-blue-400/20 bg-[#0d1a2f] p-6">
            <h2 className="text-2xl font-black">Choose the safe option</h2>
            <div className="mt-5 grid gap-3">
              {riskItems.map((item, index) => {
                const selected = riskChoices[index];
                return (
                  <div key={item.label} className="rounded-2xl border border-blue-400/20 bg-blue-950/50 p-4">
                    <p className="font-black">{item.label}</p>
                    <div className="mt-3 flex gap-3">
                      <button onClick={() => setRiskChoices((prev) => ({ ...prev, [index]: item.safe ? "safe" : "unsafe" }))} className="rounded-xl bg-emerald-500 px-4 py-2 font-black">Safe</button>
                      <button onClick={() => setRiskChoices((prev) => ({ ...prev, [index]: item.safe ? "unsafe" : "safe" }))} className="rounded-xl bg-red-500 px-4 py-2 font-black">Risky</button>
                    </div>
                    {selected === "safe" ? <p className="mt-2 text-emerald-200">✅ Correct choice</p> : selected === "unsafe" ? <p className="mt-2 text-red-200">❌ Try again</p> : null}
                  </div>
                );
              })}
            </div>
          </section>
        ) : (
          <section className="mt-6 rounded-3xl border border-blue-400/20 bg-[#0d1a2f] p-6 text-center">
            <h2 className="text-2xl font-black">Charge the Reactor</h2>
            <div className="mx-auto mt-6 flex h-48 w-48 items-center justify-center rounded-full border border-cyan-300/30 bg-cyan-300/10 text-6xl font-black shadow-2xl shadow-cyan-500/10">{tapScore}/12</div>
            <button onClick={() => setTapScore((v) => Math.min(12, v + 1))} className="mt-6 rounded-full bg-blue-500 px-10 py-5 text-xl font-black hover:bg-blue-400">TAP</button>
          </section>
        )}

        <section className="mt-6 rounded-3xl border border-blue-400/20 bg-[#0d1a2f] p-6">
          {complete && !claimed ? <button onClick={claimReward} className="rounded-2xl bg-emerald-500 px-6 py-3 font-black hover:bg-emerald-400">Claim {game.reward} KARPY Points</button> : null}
          {!complete ? <p className="text-blue-100">Complete the game to unlock the reward.</p> : null}
          {claimed ? <div className="rounded-2xl bg-emerald-500/10 p-4 text-emerald-200">✅ Game complete. Reward claimed.</div> : null}
          {error ? <div className="mt-4 rounded-2xl bg-yellow-500/10 p-4 text-yellow-100">{error}</div> : null}
        </section>
      </div>
    </main>
  );
}

export default function GamesPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-[#061123] p-8 text-white">Loading KARPY Games...</main>}>
      <GamesContent />
    </Suspense>
  );
}
