"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";

const LESSONS = {
  crypto_basics: {
    title: "Crypto Basics",
    taskId: "learn_crypto",
    reward: 120,
    intro:
      "Crypto is a digital system where people can transfer value or data without relying on one central company.",
    points: [
      "A blockchain is a public record of transactions.",
      "A wallet stores access to your assets, not the coins themselves.",
      "A seed phrase is private and must never be shared.",
      "KARPY Points are in-app rewards only, not cash payouts.",
    ],
    question: "What should you never share?",
    answers: ["Seed phrase", "Public username", "Referral code"],
    correct: "Seed phrase",
  },
  wallet_safety: {
    title: "Wallet Safety",
    taskId: "learn_wallet",
    reward: 120,
    intro:
      "Wallet safety is one of the most important skills in crypto. Most losses happen because people share secrets or trust fake links.",
    points: [
      "Never type your seed phrase into unknown websites.",
      "Check links before connecting any wallet.",
      "A real admin will never ask for your recovery phrase.",
      "Use small amounts when testing new apps.",
    ],
    question: "Who can safely ask for your seed phrase?",
    answers: ["Nobody", "Telegram admin", "Support agent"],
    correct: "Nobody",
  },
  risk: {
    title: "Crypto Risk",
    taskId: "learn_risk",
    reward: 120,
    intro:
      "Crypto prices can move very fast. Learning risk is more important than chasing hype.",
    points: [
      "High rewards usually come with high risk.",
      "Never invest money you need for bills.",
      "DYOR means Do Your Own Research.",
      "KARPY does not promise profit or token payouts.",
    ],
    question: "What does DYOR mean?",
    answers: ["Do Your Own Research", "Double Your Online Reward", "Deposit Your Own Risk"],
    correct: "Do Your Own Research",
  },
} as const;

type LessonKey = keyof typeof LESSONS;

function LearnContent() {
  const searchParams = useSearchParams();
  const mission = (searchParams.get("mission") || "crypto_basics") as LessonKey;
  const lesson = LESSONS[mission] || LESSONS.crypto_basics;

  const [selected, setSelected] = useState("");
  const [claimed, setClaimed] = useState(false);
  const [error, setError] = useState("");

  const isCorrect = selected === lesson.correct;

  async function claimReward() {
    if (!isCorrect || claimed) return;

    setError("");

    const res = await fetch("/api/karpy/task/complete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ taskId: lesson.taskId }),
    });

    if (res.ok) {
      setClaimed(true);
      return;
    }

    const data = await res.json().catch(() => null);
    setError(data?.error || "Reward already claimed or unavailable.");
  }

  return (
    <main className="min-h-screen bg-[#07111f] px-4 py-8 text-white">
      <div className="mx-auto max-w-4xl">
        <a href="/" className="text-blue-300 hover:text-blue-200">
          ← Back to KARPY
        </a>

        <section className="mt-6 rounded-3xl border border-blue-500/20 bg-[#0e1a2d] p-6 shadow-2xl">
          <p className="text-sm uppercase tracking-[0.25em] text-blue-300">
            Learn & Earn
          </p>
          <h1 className="mt-2 text-4xl font-black">{lesson.title}</h1>
          <p className="mt-3 text-blue-100">{lesson.intro}</p>
          <p className="mt-4 rounded-2xl bg-blue-500/10 p-4 text-sm text-blue-100">
            Reward: <b>{lesson.reward} KARPY Points</b>. Points are for in-app
            progress only, not cash payouts or token withdrawals.
          </p>
        </section>

        <section className="mt-6 rounded-3xl border border-blue-500/20 bg-[#111c31] p-6">
          <h2 className="text-2xl font-black">Quick Lesson</h2>

          <div className="mt-5 grid gap-3">
            {lesson.points.map((point) => (
              <div
                key={point}
                className="rounded-2xl border border-blue-400/20 bg-blue-950/50 p-4 text-blue-100"
              >
                ✅ {point}
              </div>
            ))}
          </div>
        </section>

        <section className="mt-6 rounded-3xl border border-blue-500/20 bg-[#111c31] p-6">
          <h2 className="text-2xl font-black">Quiz</h2>
          <p className="mt-2 text-blue-100">{lesson.question}</p>

          <div className="mt-5 grid gap-3">
            {lesson.answers.map((answer) => (
              <button
                key={answer}
                onClick={() => setSelected(answer)}
                className={`rounded-2xl border p-4 text-left font-black transition ${
                  selected === answer
                    ? "border-blue-300 bg-blue-500"
                    : "border-blue-400/20 bg-blue-950/50 hover:bg-blue-900"
                }`}
              >
                {answer}
              </button>
            ))}
          </div>

          {selected && !isCorrect && (
            <p className="mt-4 rounded-2xl bg-red-500/10 p-4 text-red-200">
              Not quite. Try again.
            </p>
          )}

          {isCorrect && !claimed && (
            <button
              onClick={claimReward}
              className="mt-6 rounded-2xl bg-emerald-500 px-6 py-3 font-black hover:bg-emerald-400"
            >
              Claim {lesson.reward} KARPY Points
            </button>
          )}

          {claimed && (
            <div className="mt-6 rounded-3xl border border-emerald-400/30 bg-emerald-500/10 p-5 text-emerald-200">
              ✅ Lesson complete. Reward claimed successfully.
            </div>
          )}

          {error && (
            <div className="mt-6 rounded-3xl border border-yellow-400/30 bg-yellow-500/10 p-5 text-yellow-100">
              {error}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default function LearnPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#07111f] p-8 text-white">
          Loading KARPY Learn...
        </main>
      }
    >
      <LearnContent />
    </Suspense>
  );
}