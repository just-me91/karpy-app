"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";

type Lesson = {
  title: string;
  subtitle: string;
  taskId: string;
  reward: number;
  reading: string[];
  example: string;
  question: string;
  answers: string[];
  correct: string;
};

const LESSONS: Record<string, Lesson> = {
  crypto_basics: {
    title: "Crypto Basics",
    subtitle: "Understand what blockchain means before chasing hype.",
    taskId: "learn_crypto_basics",
    reward: 140,
    reading: [
      "Crypto is a digital system for storing and transferring value or data.",
      "A blockchain is a shared public record that many computers can verify.",
      "Not every crypto project has real utility, and not every point system is a token.",
      "KARPY Points are in-app progress rewards used inside the KARPY ecosystem.",
    ],
    example: "Example: Bitcoin uses a blockchain for transfers. KARPY currently uses points for app progress, not withdrawals.",
    question: "What are KARPY Points used for right now?",
    answers: ["In-app progress", "Guaranteed cash withdrawals", "Seed phrase storage"],
    correct: "In-app progress",
  },
  wallet_safety: {
    title: "Wallet Safety",
    subtitle: "Learn the rules that protect people from common crypto scams.",
    taskId: "learn_wallet_safety",
    reward: 160,
    reading: [
      "A seed phrase is private. Anyone with it can recover the wallet.",
      "Real support teams do not need your seed phrase.",
      "Fake links and fake airdrops are common scam methods.",
      "Always check links before connecting a wallet or entering details.",
    ],
    example: "Example: If somebody on Telegram asks for your recovery phrase, it is a scam.",
    question: "Who should you share your seed phrase with?",
    answers: ["Nobody", "Support agent", "Telegram admin"],
    correct: "Nobody",
  },
  risk_management: {
    title: "Risk Management",
    subtitle: "Good users learn risk before rewards.",
    taskId: "learn_risk_management",
    reward: 160,
    reading: [
      "High rewards usually come with high risk.",
      "DYOR means Do Your Own Research.",
      "Never use money needed for rent, bills, food, or family expenses.",
      "KARPY does not promise profit. It rewards learning, activity, and progress.",
    ],
    example: "Example: A project promising guaranteed profit is usually more dangerous than a project explaining risks clearly.",
    question: "What does DYOR mean?",
    answers: ["Do Your Own Research", "Double Your Online Reward", "Deposit Your Own Risk"],
    correct: "Do Your Own Research",
  },
  karpy_points: {
    title: "What are KARPY Points?",
    subtitle: "Understand the KARPY ecosystem before inviting others.",
    taskId: "learn_karpy_points",
    reward: 120,
    reading: [
      "KARPY is an early-stage digital reward ecosystem.",
      "Users earn KARPY Points by mining daily, learning, completing missions, and growing their team.",
      "KARPY Points are not currently withdrawable and have no guaranteed market value.",
      "Future features may include more missions, competitions, marketplace utilities, and premium tools.",
    ],
    example: "Example: Think of KARPY Points like early app progress points, not money in your bank account.",
    question: "Does KARPY currently promise token payouts?",
    answers: ["No", "Yes", "Only if you refresh"],
    correct: "No",
  },
  streaks: {
    title: "Why Streaks Matter",
    subtitle: "Consistency makes the app feel alive.",
    taskId: "streak_3_task",
    reward: 300,
    reading: [
      "A streak shows how many days you keep returning.",
      "Streaks help users build a daily habit.",
      "Higher streaks can improve future rewards and ranking.",
      "Missing days can slow progression, so daily activity matters.",
    ],
    example: "Example: A 7-day active user should feel more valuable than a user who appears once and disappears.",
    question: "What does a streak reward?",
    answers: ["Consistency", "Random wallet transfers", "Sharing a seed phrase"],
    correct: "Consistency",
  },
  levels: {
    title: "Levels and XP",
    subtitle: "Progression gives users a reason to continue.",
    taskId: "level_3_task",
    reward: 350,
    reading: [
      "XP is earned through mining and missions.",
      "Levels show long-term progress.",
      "Higher levels can unlock better bonuses and status.",
      "This makes KARPY more than a simple button-click app.",
    ],
    example: "Example: Level 5 users may unlock stronger future missions or better chest odds.",
    question: "What does XP help increase?",
    answers: ["Mining level", "Password strength", "Network gas fees"],
    correct: "Mining level",
  },
};

function LearnContent() {
  const searchParams = useSearchParams();
  const mission = searchParams.get("mission") || "crypto_basics";
  const lesson = LESSONS[mission] || LESSONS.crypto_basics;

  const [selected, setSelected] = useState("");
  const [claimed, setClaimed] = useState(false);
  const [error, setError] = useState("");
  const correct = selected === lesson.correct;

  async function claimReward() {
    if (!correct || claimed) return;
    setError("");

    const res = await fetch("/api/karpy/task/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
    <main className="min-h-screen bg-[#061123] px-4 py-8 text-white">
      <div className="mx-auto max-w-5xl">
        <a href="/" className="text-blue-300 hover:text-blue-200">← Back to KARPY</a>

        <section className="mt-6 rounded-3xl border border-blue-400/20 bg-gradient-to-br from-[#0e1b33] to-[#071426] p-6 shadow-2xl">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-cyan-300">Learn & Earn</p>
          <h1 className="mt-3 text-4xl font-black">{lesson.title}</h1>
          <p className="mt-3 text-blue-100">{lesson.subtitle}</p>
          <div className="mt-5 rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-4 text-cyan-100">
            Reward: <b>{lesson.reward} KARPY Points</b> after reading and passing the check.
          </div>
        </section>

        <section className="mt-6 rounded-3xl border border-blue-400/20 bg-[#0d1a2f] p-6">
          <h2 className="text-2xl font-black">Quick Lesson</h2>
          <div className="mt-5 grid gap-3">
            {lesson.reading.map((line) => (
              <div key={line} className="rounded-2xl border border-blue-400/15 bg-blue-950/50 p-4 text-blue-100">✅ {line}</div>
            ))}
          </div>
          <div className="mt-5 rounded-2xl border border-yellow-300/20 bg-yellow-300/10 p-4 text-yellow-100">💡 {lesson.example}</div>
        </section>

        <section className="mt-6 rounded-3xl border border-blue-400/20 bg-[#0d1a2f] p-6">
          <h2 className="text-2xl font-black">Knowledge Check</h2>
          <p className="mt-3 text-blue-100">{lesson.question}</p>
          <div className="mt-5 grid gap-3">
            {lesson.answers.map((answer) => (
              <button
                key={answer}
                onClick={() => setSelected(answer)}
                className={`rounded-2xl border p-4 text-left font-black transition ${
                  selected === answer
                    ? correct
                      ? "border-emerald-300 bg-emerald-500/25"
                      : "border-red-300 bg-red-500/25"
                    : "border-blue-400/20 bg-blue-950/50 hover:bg-blue-900"
                }`}
              >
                {answer}
              </button>
            ))}
          </div>

          {selected && !correct ? <p className="mt-4 rounded-2xl bg-red-500/10 p-4 text-red-200">Not quite. Read the lesson and try again.</p> : null}
          {correct && !claimed ? (
            <button onClick={claimReward} className="mt-6 rounded-2xl bg-emerald-500 px-6 py-3 font-black hover:bg-emerald-400">
              Claim {lesson.reward} KARPY Points
            </button>
          ) : null}
          {claimed ? <div className="mt-6 rounded-2xl bg-emerald-500/10 p-4 text-emerald-200">✅ Mission complete. Reward claimed.</div> : null}
          {error ? <div className="mt-6 rounded-2xl bg-yellow-500/10 p-4 text-yellow-100">{error}</div> : null}
        </section>
      </div>
    </main>
  );
}

export default function LearnPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-[#061123] p-8 text-white">Loading KARPY Learn...</main>}>
      <LearnContent />
    </Suspense>
  );
}
