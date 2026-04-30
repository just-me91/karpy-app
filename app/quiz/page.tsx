"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

type Question = {
  context: string;
  question: string;
  answers: string[];
  correct: string;
  explain: string;
};

const QUIZZES: Record<string, { title: string; taskId: string; reward: number; intro: string; questions: Question[] }> = {
  daily_crypto_quiz: {
    title: "Daily Crypto Quiz",
    taskId: "quiz_daily_crypto",
    reward: 180,
    intro: "Read each short note, then answer. The goal is learning, not guessing.",
    questions: [
      {
        context: "DYOR means Do Your Own Research. It reminds people not to trust hype blindly.",
        question: "What does DYOR mean?",
        answers: ["Do Your Own Research", "Deposit Your Own Reward", "Double Your Risk"],
        correct: "Do Your Own Research",
        explain: "Correct. Research matters before trusting any project.",
      },
      {
        context: "Gas fees are transaction fees paid to process actions on some blockchains.",
        question: "What is a gas fee?",
        answers: ["A blockchain transaction fee", "A referral code", "A mining animation"],
        correct: "A blockchain transaction fee",
        explain: "Correct. Gas is the cost of processing some blockchain actions.",
      },
      {
        context: "KARPY Points are in-app rewards for progress. They are not guaranteed money.",
        question: "Should KARPY Points be treated as guaranteed cash?",
        answers: ["No", "Yes", "Only after 7 days"],
        correct: "No",
        explain: "Correct. KARPY Points are app progress rewards.",
      },
    ],
  },
  safety_quiz: {
    title: "Wallet Safety Quiz",
    taskId: "quiz_safety",
    reward: 180,
    intro: "Learn the safety rule first, then answer the check.",
    questions: [
      {
        context: "A seed phrase can recover a wallet. Anyone who has it can take control.",
        question: "Who should you share your seed phrase with?",
        answers: ["Nobody", "Support agent", "Telegram admin"],
        correct: "Nobody",
        explain: "Correct. Nobody should get your seed phrase.",
      },
      {
        context: "Fake links often copy real websites. Always check the official source.",
        question: "What should you do before clicking a crypto link?",
        answers: ["Check if it is official", "Enter seed phrase quickly", "Ignore warnings"],
        correct: "Check if it is official",
        explain: "Correct. Link checking prevents many scams.",
      },
      {
        context: "Testing with small amounts reduces the damage if something goes wrong.",
        question: "What is safest when testing a new crypto app?",
        answers: ["Use small amounts", "Use all funds", "Share private key"],
        correct: "Use small amounts",
        explain: "Correct. Small tests reduce risk.",
      },
    ],
  },
};

function QuizContent() {
  const searchParams = useSearchParams();
  const mission = searchParams.get("mission") || "daily_crypto_quiz";
  const quiz = useMemo(() => QUIZZES[mission] || QUIZZES.daily_crypto_quiz, [mission]);

  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [claimed, setClaimed] = useState(false);
  const [error, setError] = useState("");

  const correctCount = quiz.questions.reduce((count, q, index) => count + (answers[index] === q.correct ? 1 : 0), 0);
  const completed = Object.keys(answers).length === quiz.questions.length;
  const passed = completed && correctCount === quiz.questions.length;

  async function claimReward() {
    if (!passed || claimed) return;
    setError("");
    const res = await fetch("/api/karpy/task/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
    <main className="min-h-screen bg-[#061123] px-4 py-8 text-white">
      <div className="mx-auto max-w-5xl">
        <a href="/" className="text-blue-300 hover:text-blue-200">← Back to KARPY</a>
        <section className="mt-6 rounded-3xl border border-purple-400/20 bg-gradient-to-br from-[#11172f] to-[#071426] p-6 shadow-2xl">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-purple-300">KARPY Quiz</p>
          <h1 className="mt-3 text-4xl font-black">{quiz.title}</h1>
          <p className="mt-3 text-blue-100">{quiz.intro}</p>
          <p className="mt-4 rounded-2xl bg-purple-500/10 p-4 text-purple-100">Reward: <b>{quiz.reward} KARPY Points</b></p>
        </section>

        <section className="mt-6 grid gap-5">
          {quiz.questions.map((q, index) => {
            const selected = answers[index];
            const isCorrect = selected === q.correct;
            const isWrong = selected && !isCorrect;
            return (
              <div key={q.question} className="rounded-3xl border border-blue-400/20 bg-[#0d1a2f] p-6">
                <p className="text-sm font-black uppercase tracking-[0.2em] text-cyan-300">Read first</p>
                <div className="mt-3 rounded-2xl bg-blue-500/10 p-4 text-blue-100">{q.context}</div>
                <h2 className="mt-5 text-2xl font-black">{q.question}</h2>
                <div className="mt-5 grid gap-3">
                  {q.answers.map((answer) => (
                    <button
                      key={answer}
                      onClick={() => setAnswers((prev) => ({ ...prev, [index]: answer }))}
                      className={`rounded-2xl border p-4 text-left font-black transition ${
                        selected === answer
                          ? isCorrect
                            ? "border-emerald-300 bg-emerald-500/25"
                            : "border-red-300 bg-red-500/25"
                          : "border-blue-400/20 bg-blue-950/50 hover:bg-blue-900"
                      }`}
                    >
                      {answer}
                    </button>
                  ))}
                </div>
                {isCorrect ? <p className="mt-4 rounded-2xl bg-emerald-500/10 p-4 text-emerald-200">✅ {q.explain}</p> : null}
                {isWrong ? <p className="mt-4 rounded-2xl bg-red-500/10 p-4 text-red-200">❌ Not quite. Read the note and try again.</p> : null}
              </div>
            );
          })}
        </section>

        <section className="mt-6 rounded-3xl border border-blue-400/20 bg-[#0d1a2f] p-6">
          <h2 className="text-2xl font-black">Result</h2>
          <p className="mt-2 text-blue-100">Score: {correctCount}/{quiz.questions.length}</p>
          {passed && !claimed ? <button onClick={claimReward} className="mt-6 rounded-2xl bg-emerald-500 px-6 py-3 font-black hover:bg-emerald-400">Claim {quiz.reward} KARPY Points</button> : null}
          {completed && !passed ? <p className="mt-4 rounded-2xl bg-yellow-500/10 p-4 text-yellow-100">Fix the wrong answers to unlock the reward.</p> : null}
          {claimed ? <div className="mt-6 rounded-2xl bg-emerald-500/10 p-4 text-emerald-200">✅ Quiz complete. Reward claimed.</div> : null}
          {error ? <div className="mt-6 rounded-2xl bg-yellow-500/10 p-4 text-yellow-100">{error}</div> : null}
        </section>
      </div>
    </main>
  );
}

export default function QuizPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-[#061123] p-8 text-white">Loading KARPY Quiz...</main>}>
      <QuizContent />
    </Suspense>
  );
}
