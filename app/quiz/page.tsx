"use client";

import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

const QUIZZES = {
  daily: {
    taskId: "quiz_daily_crypto",
    title: "Daily Crypto Quiz",
    reward: 160,
    questions: [
      { q: "What does DYOR mean?", answers: ["Do Your Own Research", "Double Yield On Risk", "Deposit Your Online Reward"], correct: 0 },
      { q: "What is a gas fee?", answers: ["A network transaction fee", "A free reward", "A mining button colour"], correct: 0 },
      { q: "What is a stablecoin designed to do?", answers: ["Track a stable value", "Guarantee profit", "Remove all risk"], correct: 0 },
    ],
  },
  risk: {
    taskId: "quiz_risk",
    title: "Risk Awareness Test",
    reward: 180,
    questions: [
      { q: "What is a red flag in crypto?", answers: ["Guaranteed profits", "Clear risk warning", "Open documentation"], correct: 0 },
      { q: "Should you share your seed phrase?", answers: ["Never", "Only with strangers", "Only on social media"], correct: 0 },
      { q: "What should KARPY Points be treated as?", answers: ["In-app rewards", "Guaranteed cash", "A bank deposit"], correct: 0 },
    ],
  },
} as const;

type QuizKey = keyof typeof QUIZZES;

export default function QuizPage() {
  const params = useSearchParams();
  const key = (params.get("mission") || "daily") as QuizKey;
  const quiz = QUIZZES[key] || QUIZZES.daily;
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const score = useMemo(
    () => quiz.questions.reduce((sum, item, i) => sum + (answers[i] === item.correct ? 1 : 0), 0),
    [answers, quiz]
  );

  const passed = score === quiz.questions.length;

  async function claimReward() {
    if (!passed) {
      setStatus("Answer all questions correctly first.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/karpy/task/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId: quiz.taskId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus(data.error || "Quiz could not be completed.");
        return;
      }
      setStatus(`Quiz complete. +${data.reward} KARPY Points added.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Quiz failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={pageWrap}>
      <section style={heroCard}>
        <div style={badge}>Crypto Quiz</div>
        <h1 style={title}>{quiz.title}</h1>
        <p style={subtitle}>Answer correctly to earn KARPY Points. This is built for education, not payout promises.</p>
      </section>

      <section style={contentCard}>
        {quiz.questions.map((item, index) => (
          <div key={item.q} style={questionCard}>
            <h2 style={sectionTitle}>{index + 1}. {item.q}</h2>
            <div style={{ display: "grid", gap: 10 }}>
              {item.answers.map((answer, answerIndex) => (
                <button
                  key={answer}
                  onClick={() => setAnswers((prev) => ({ ...prev, [index]: answerIndex }))}
                  style={{
                    ...answerButton,
                    borderColor: answers[index] === answerIndex ? "#38bdf8" : "rgba(255,255,255,0.08)",
                    background: answers[index] === answerIndex ? "rgba(56,189,248,0.16)" : "rgba(255,255,255,0.04)",
                  }}
                >
                  {answer}
                </button>
              ))}
            </div>
          </div>
        ))}

        <div style={scoreBox}>Score: {score}/{quiz.questions.length}</div>
        <button disabled={!passed || loading} onClick={claimReward} style={{ ...primaryButton, opacity: !passed || loading ? 0.6 : 1 }}>
          {loading ? "Saving..." : `Claim +${quiz.reward} KARPY Points`}
        </button>
        {status ? <div style={statusBox}>{status}</div> : null}
      </section>

      <a href="/" style={backLink}>← Back to mining dashboard</a>
    </main>
  );
}

const pageWrap: React.CSSProperties = { minHeight: "100vh", padding: 24, background: "radial-gradient(circle at top, #1d4ed8 0, #020617 42%, #000 100%)", color: "white" };
const heroCard: React.CSSProperties = { maxWidth: 900, margin: "0 auto 18px", padding: 24, borderRadius: 28, background: "rgba(15,23,42,0.82)", border: "1px solid rgba(147,197,253,0.16)" };
const contentCard: React.CSSProperties = { maxWidth: 900, margin: "0 auto 18px", padding: 22, borderRadius: 24, background: "rgba(15,23,42,0.72)", border: "1px solid rgba(255,255,255,0.08)" };
const questionCard: React.CSSProperties = { padding: 16, borderRadius: 18, background: "rgba(255,255,255,0.035)", marginBottom: 14 };
const badge: React.CSSProperties = { display: "inline-flex", padding: "7px 11px", borderRadius: 999, border: "1px solid rgba(56,189,248,0.5)", color: "#7dd3fc", fontSize: 12, fontWeight: 900, marginBottom: 12 };
const title: React.CSSProperties = { fontSize: 38, lineHeight: 1.05, margin: 0, fontWeight: 950 };
const subtitle: React.CSSProperties = { color: "#bfdbfe", fontSize: 16, lineHeight: 1.7 };
const sectionTitle: React.CSSProperties = { marginTop: 0, fontSize: 19, fontWeight: 900 };
const answerButton: React.CSSProperties = { padding: 14, borderRadius: 15, color: "white", border: "1px solid", textAlign: "left", cursor: "pointer", fontWeight: 800 };
const scoreBox: React.CSSProperties = { padding: 14, borderRadius: 16, background: "rgba(59,130,246,0.12)", border: "1px solid rgba(147,197,253,0.18)", color: "#bfdbfe", fontWeight: 900 };
const primaryButton: React.CSSProperties = { width: "100%", marginTop: 16, padding: 15, borderRadius: 16, border: "none", background: "linear-gradient(135deg,#2563eb,#38bdf8)", color: "white", fontWeight: 950, cursor: "pointer" };
const statusBox: React.CSSProperties = { marginTop: 14, padding: 14, borderRadius: 16, background: "rgba(59,130,246,0.12)", border: "1px solid rgba(147,197,253,0.18)", color: "#bfdbfe" };
const backLink: React.CSSProperties = { display: "block", maxWidth: 900, margin: "0 auto", color: "#93c5fd", textDecoration: "none", fontWeight: 900 };
