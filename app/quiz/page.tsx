"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

type Question = {
  question: string;
  answers: string[];
  correct: string;
  explain: string;
};

const QUIZZES: Record<
  string,
  {
    title: string;
    taskId: string;
    reward: number;
    questions: Question[];
  }
> = {
  daily_crypto_quiz: {
    title: "Daily Crypto Quiz",
    taskId: "quiz_daily",
    reward: 150,
    questions: [
      {
        question: "What does DYOR mean?",
        answers: ["Do Your Own Research", "Deposit Your Own Reward", "Double Your Risk"],
        correct: "Do Your Own Research",
        explain: "DYOR means checking information yourself before trusting hype.",
      },
      {
        question: "What is a seed phrase?",
        answers: ["A private wallet recovery phrase", "A public username", "A trading fee"],
        correct: "A private wallet recovery phrase",
        explain: "A seed phrase controls wallet recovery and must never be shared.",
      },
      {
        question: "What is a gas fee?",
        answers: ["A blockchain transaction fee", "A mining button", "A referral reward"],
        correct: "A blockchain transaction fee",
        explain: "Gas fees are paid to process transactions on some blockchains.",
      },
    ],
  },
  safety_quiz: {
    title: "Wallet Safety Quiz",
    taskId: "quiz_safety",
    reward: 150,
    questions: [
      {
        question: "Who should you share your seed phrase with?",
        answers: ["Nobody", "Support agent", "Telegram admin"],
        correct: "Nobody",
        explain: "No real support team should ever ask for your seed phrase.",
      },
      {
        question: "What should you do before clicking a crypto link?",
        answers: ["Check if it is official", "Enter seed phrase quickly", "Ignore warnings"],
        correct: "Check if it is official",
        explain: "Fake links are one of the biggest crypto scam methods.",
      },
      {
        question: "What is safest when testing a new crypto app?",
        answers: ["Use small amounts", "Use all your funds", "Share your private key"],
        correct: "Use small amounts",
        explain: "Testing with small amounts reduces risk.",
      },
    ],
  },
  risk_quiz: {
    title: "Crypto Risk Quiz",
    taskId: "quiz_risk",
    reward: 150,
    questions: [
      {
        question: "What usually comes with very high rewards?",
        answers: ["Higher risk", "Guaranteed profit", "No risk"],
        correct: "Higher risk",
        explain: "High rewards usually mean higher risk.",
      },
      {
        question: "Should KARPY Points be treated as guaranteed money?",
        answers: ["No", "Yes", "Only on weekends"],
        correct: "No",
        explain: "KARPY Points are in-app progress rewards, not guaranteed cash.",
      },
      {
        question: "What should you avoid investing?",
        answers: ["Money needed for bills", "Time learning", "Small test amounts"],
        correct: "Money needed for bills",
        explain: "Never risk money needed for important expenses.",
      },
    ],
  },
};

function QuizContent() {
  const searchParams = useSearchParams();
  const mission = searchParams.get("mission") || "daily_crypto_quiz";

  const quiz = useMemo(() => {
    return QUIZZES[mission] || QUIZZES.daily_crypto_quiz;
  }, [mission]);

  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [claimed, setClaimed] = useState(false);
  const [error, setError] = useState("");

  const correctCount = quiz.questions.reduce((count, q, index) => {
    return answers[index] === q.correct ? count + 1 : count;
  }, 0);

  const completed = Object.keys(answers).length === quiz.questions.length;
  const passed = completed && correctCount === quiz.questions.length;

  async function claimReward() {
    if (!passed || claimed) return;

    setError("");

    const res = await fetch("/api/karpy/task/complete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ taskId: quiz.taskId }),
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
            KARPY Quiz
          </p>
          <h1 className="mt-2 text-4xl font-black">{quiz.title}</h1>
          <p className="mt-3 text-blue-100">
            Answer all questions correctly to earn KARPY Points. Points are for
            in-app progress only, not cash payouts or token withdrawals.
          </p>
          <p className="mt-4 rounded-2xl bg-blue-500/10 p-4 text-sm text-blue-100">
            Reward: <b>{quiz.reward} KARPY Points</b>
          </p>
        </section>

        <section className="mt-6 grid gap-5">
          {quiz.questions.map((q, index) => {
            const selected = answers[index];
            const isCorrect = selected === q.correct;
            const isWrong = selected && !isCorrect;

            return (
              <div
                key={q.question}
                className="rounded-3xl border border-blue-500/20 bg-[#111c31] p-6"
              >
                <p className="text-sm font-black uppercase tracking-[0.2em] text-blue-300">
                  Question {index + 1}
                </p>
                <h2 className="mt-2 text-2xl font-black">{q.question}</h2>

                <div className="mt-5 grid gap-3">
                  {q.answers.map((answer) => (
                    <button
                      key={answer}
                      onClick={() =>
                        setAnswers((prev) => ({
                          ...prev,
                          [index]: answer,
                        }))
                      }
                      className={`rounded-2xl border p-4 text-left font-black transition ${
                        selected === answer
                          ? isCorrect
                            ? "border-emerald-300 bg-emerald-500/30"
                            : "border-red-300 bg-red-500/30"
                          : "border-blue-400/20 bg-blue-950/50 hover:bg-blue-900"
                      }`}
                    >
                      {answer}
                    </button>
                  ))}
                </div>

                {isCorrect && (
                  <p className="mt-4 rounded-2xl bg-emerald-500/10 p-4 text-emerald-200">
                    ✅ Correct. {q.explain}
                  </p>
                )}

                {isWrong && (
                  <p className="mt-4 rounded-2xl bg-red-500/10 p-4 text-red-200">
                    ❌ Not quite. Try again.
                  </p>
                )}
              </div>
            );
          })}
        </section>

        <section className="mt-6 rounded-3xl border border-blue-500/20 bg-[#111c31] p-6">
          <h2 className="text-2xl font-black">Result</h2>
          <p className="mt-2 text-blue-100">
            Score: {correctCount}/{quiz.questions.length}
          </p>

          {!completed && (
            <p className="mt-4 rounded-2xl bg-blue-500/10 p-4 text-blue-100">
              Answer all questions to unlock your reward.
            </p>
          )}

          {completed && !passed && (
            <p className="mt-4 rounded-2xl bg-yellow-500/10 p-4 text-yellow-100">
              Some answers are wrong. Fix them and try again.
            </p>
          )}

          {passed && !claimed && (
            <button
              onClick={claimReward}
              className="mt-6 rounded-2xl bg-emerald-500 px-6 py-3 font-black hover:bg-emerald-400"
            >
              Claim {quiz.reward} KARPY Points
            </button>
          )}

          {claimed && (
            <div className="mt-6 rounded-3xl border border-emerald-400/30 bg-emerald-500/10 p-5 text-emerald-200">
              ✅ Quiz complete. Reward claimed successfully.
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

export default function QuizPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#07111f] p-8 text-white">
          Loading KARPY Quiz...
        </main>
      }
    >
      <QuizContent />
    </Suspense>
  );
}