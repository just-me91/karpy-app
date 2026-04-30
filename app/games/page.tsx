"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";

function GamesContent() {
  const searchParams = useSearchParams();
  const mission = searchParams.get("mission") || "tap_reactor";

  const [tapScore, setTapScore] = useState(0);
  const [memoryDone, setMemoryDone] = useState(false);
  const [riskDone, setRiskDone] = useState(false);
  const [claimed, setClaimed] = useState(false);

  async function claimReward(taskId: string) {
    if (claimed) return;

    const res = await fetch("/api/karpy/task/complete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ taskId }),
    });

    if (res.ok) {
      setClaimed(true);
    } else {
      alert("Reward already claimed or task unavailable.");
    }
  }

  return (
    <main className="min-h-screen bg-[#07111f] text-white px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <a href="/" className="text-blue-300 hover:text-blue-200">
          ← Back to KARPY
        </a>

        <section className="mt-6 rounded-3xl border border-blue-500/20 bg-[#0e1a2d] p-6 shadow-2xl">
          <p className="text-sm uppercase tracking-[0.25em] text-blue-300">
            KARPY Games
          </p>
          <h1 className="mt-2 text-4xl font-black">Play & Earn KARPY Points</h1>
          <p className="mt-3 text-blue-100">
            Complete small in-app games to earn KARPY Points. Points are for
            app progress only, not cash payouts or token withdrawals.
          </p>
        </section>

        {mission === "memory" && (
          <section className="mt-6 rounded-3xl border border-blue-500/20 bg-[#111c31] p-6">
            <h2 className="text-2xl font-black">Memory Match</h2>
            <p className="mt-2 text-blue-100">
              Match the crypto concepts. This simplified version completes after
              you press the challenge button.
            </p>

            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {["BTC", "ETH", "KPY", "NFT", "DEX", "DAO", "WALLET", "CHAIN"].map(
                (item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-blue-400/20 bg-blue-950/50 p-5 text-center font-black"
                  >
                    {item}
                  </div>
                )
              )}
            </div>

            {!memoryDone ? (
              <button
                onClick={() => setMemoryDone(true)}
                className="mt-6 rounded-2xl bg-blue-500 px-6 py-3 font-black hover:bg-blue-400"
              >
                Complete Memory Challenge
              </button>
            ) : (
              <button
                onClick={() => claimReward("game_memory")}
                className="mt-6 rounded-2xl bg-emerald-500 px-6 py-3 font-black hover:bg-emerald-400"
              >
                Claim Reward
              </button>
            )}
          </section>
        )}

        {mission === "risk" && (
          <section className="mt-6 rounded-3xl border border-blue-500/20 bg-[#111c31] p-6">
            <h2 className="text-2xl font-black">Risk Choice</h2>
            <p className="mt-2 text-blue-100">
              Learn that higher reward often means higher risk.
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {["Low Risk", "Medium Risk", "High Risk"].map((item) => (
                <button
                  key={item}
                  onClick={() => setRiskDone(true)}
                  className="rounded-2xl border border-blue-400/20 bg-blue-950/50 p-5 font-black hover:bg-blue-800"
                >
                  {item}
                </button>
              ))}
            </div>

            {riskDone && (
              <button
                onClick={() => claimReward("game_risk")}
                className="mt-6 rounded-2xl bg-emerald-500 px-6 py-3 font-black hover:bg-emerald-400"
              >
                Claim Reward
              </button>
            )}
          </section>
        )}

        {mission !== "memory" && mission !== "risk" && (
          <section className="mt-6 rounded-3xl border border-blue-500/20 bg-[#111c31] p-6">
            <h2 className="text-2xl font-black">Tap Reactor</h2>
            <p className="mt-2 text-blue-100">
              Tap 10 times to charge the KARPY reactor.
            </p>

            <div className="mt-6 rounded-3xl bg-blue-950/60 p-6 text-center">
              <p className="text-6xl font-black">{tapScore}</p>
              <p className="mt-2 text-blue-200">/ 10 taps</p>

              <button
                onClick={() => setTapScore((v) => Math.min(10, v + 1))}
                className="mt-6 rounded-full bg-blue-500 px-10 py-5 text-xl font-black hover:bg-blue-400"
              >
                TAP
              </button>
            </div>

            {tapScore >= 10 && (
              <button
                onClick={() => claimReward("game_tap")}
                className="mt-6 rounded-2xl bg-emerald-500 px-6 py-3 font-black hover:bg-emerald-400"
              >
                Claim Reward
              </button>
            )}
          </section>
        )}

        {claimed && (
          <div className="mt-6 rounded-3xl border border-emerald-400/30 bg-emerald-500/10 p-5 text-emerald-200">
            ✅ Reward claimed successfully. Go back to dashboard to see your
            progress.
          </div>
        )}
      </div>
    </main>
  );
}

export default function GamesPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#07111f] p-8 text-white">
          Loading KARPY Games...
        </main>
      }
    >
      <GamesContent />
    </Suspense>
  );
}