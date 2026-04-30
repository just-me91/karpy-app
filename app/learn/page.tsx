"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

const LESSONS = {
  blockchain: {
    taskId: "learn_blockchain",
    title: "What is blockchain?",
    badge: "Learn & Earn",
    reward: 120,
    color: "#38bdf8",
    paragraphs: [
      "A blockchain is a shared digital record. Instead of one company holding the full record, many computers can verify the same history.",
      "Crypto uses blockchains to track transactions, ownership and network activity. The important idea is verification: users should not blindly trust hype or promises.",
      "KARPY uses learning missions to reward progress inside the app. KARPY Points are in-app rewards, not a promise of cashout or token value.",
    ],
    question: "What is the main idea behind blockchain?",
    answers: ["Shared verification", "Guaranteed profit", "Free money forever"],
    correct: 0,
  },
  wallet: {
    taskId: "learn_wallet",
    title: "Wallet safety basics",
    badge: "Safety",
    reward: 140,
    color: "#60a5fa",
    paragraphs: [
      "A crypto wallet is used to control access to crypto assets. The most important part is the recovery phrase or private key.",
      "Never type your seed phrase into random websites. Never send it to support accounts. Whoever has the seed phrase can control the wallet.",
      "This lesson is here because real crypto education matters more than hype. KARPY rewards safe learning inside the app.",
    ],
    question: "What should you never share?",
    answers: ["Your seed phrase", "Your username", "Your favourite colour"],
    correct: 0,
  },
  streak: {
    taskId: "streak_3_mission",
    title: "Streak mission",
    badge: "Progress",
    reward: 300,
    color: "#22c55e",
    paragraphs: [
      "Streaks are the daily heartbeat of KARPY. They reward users who return consistently instead of clicking once and leaving.",
      "This is similar to the engagement loop used by daily mining apps: open, claim, progress, return tomorrow.",
      "You can claim this mission only when your account has built the required streak.",
    ],
    question: "What does a streak reward?",
    answers: ["Daily consistency", "Leaving the app", "Sharing private keys"],
    correct: 0,
  },
  level: {
    taskId: "level_3_mission",
    title: "Level mission",
    badge: "Progress",
    reward: 350,
    color: "#a78bfa",
    paragraphs: [
      "Levels show long-term progress. Mining, quizzes and mini games all help your account grow.",
      "Higher levels can unlock better reward previews, stronger status and future app features.",
      "The goal is not to promise money. The goal is to build progression, knowledge and community activity.",
    ],
    question: "What do levels represent?",
    answers: ["Progress in the app", "Guaranteed income", "A bank account"],
    correct: 0,
  },
} as const;

type LessonKey = keyof typeof LESSONS;

export default function LearnPage() {
  const params = useSearchParams();
  const selected = (params.get("mission") || "blockchain") as LessonKey;
  const lesson = LESSONS[selected] || LESSONS.blockchain;
  const [answer, setAnswer] = useState<number | null>(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const correct = answer === lesson.correct;

  const otherLessons = useMemo(
    () => Object.entries(LESSONS).filter(([key]) => key !== selected),
    [selected]
  );

  async function claimReward() {
    if (!correct) {
      setStatus("Choose the correct answer first.");
      return;
    }

    try {
      setLoading(true);
      setStatus("Saving mission...");
      const res = await fetch("/api/karpy/task/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId: lesson.taskId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus(data.error || "Mission could not be completed.");
        return;
      }
      setStatus(`Mission complete. +${data.reward} KARPY Points added.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Mission failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={pageWrap}>
      <section style={heroCard}>
        <div style={{ ...badge, borderColor: lesson.color, color: lesson.color }}>{lesson.badge}</div>
        <h1 style={title}>{lesson.title}</h1>
        <p style={subtitle}>Complete the short lesson and answer the question to earn KARPY Points.</p>
      </section>

      <section style={contentCard}>
        {lesson.paragraphs.map((text) => (
          <p key={text} style={paragraph}>{text}</p>
        ))}
      </section>

      <section style={contentCard}>
        <h2 style={sectionTitle}>{lesson.question}</h2>
        <div style={{ display: "grid", gap: 12 }}>
          {lesson.answers.map((item, index) => (
            <button
              key={item}
              onClick={() => setAnswer(index)}
              style={{
                ...answerButton,
                borderColor: answer === index ? lesson.color : "rgba(255,255,255,0.08)",
                background: answer === index ? "rgba(59,130,246,0.18)" : "rgba(255,255,255,0.04)",
              }}
            >
              {item}
            </button>
          ))}
        </div>

        <button disabled={!correct || loading} onClick={claimReward} style={{ ...primaryButton, opacity: !correct || loading ? 0.6 : 1 }}>
          {loading ? "Saving..." : `Claim +${lesson.reward} KARPY Points`}
        </button>

        {status ? <div style={statusBox}>{status}</div> : null}
      </section>

      <section style={contentCard}>
        <h2 style={sectionTitle}>More lessons</h2>
        <div style={{ display: "grid", gap: 10 }}>
          {otherLessons.map(([key, item]) => (
            <a key={key} href={`/learn?mission=${key}`} style={linkCard}>{item.title}</a>
          ))}
        </div>
      </section>

      <a href="/" style={backLink}>← Back to mining dashboard</a>
    </main>
  );
}

const pageWrap: React.CSSProperties = { minHeight: "100vh", padding: 24, background: "radial-gradient(circle at top, #1d4ed8 0, #020617 42%, #000 100%)", color: "white" };
const heroCard: React.CSSProperties = { maxWidth: 900, margin: "0 auto 18px", padding: 24, borderRadius: 28, background: "rgba(15,23,42,0.82)", border: "1px solid rgba(147,197,253,0.16)", boxShadow: "0 24px 80px rgba(0,0,0,0.35)" };
const contentCard: React.CSSProperties = { maxWidth: 900, margin: "0 auto 18px", padding: 22, borderRadius: 24, background: "rgba(15,23,42,0.72)", border: "1px solid rgba(255,255,255,0.08)" };
const badge: React.CSSProperties = { display: "inline-flex", padding: "7px 11px", borderRadius: 999, border: "1px solid", fontSize: 12, fontWeight: 900, marginBottom: 12 };
const title: React.CSSProperties = { fontSize: 38, lineHeight: 1.05, margin: 0, fontWeight: 950 };
const subtitle: React.CSSProperties = { color: "#bfdbfe", fontSize: 16, lineHeight: 1.7 };
const paragraph: React.CSSProperties = { color: "#dbeafe", fontSize: 17, lineHeight: 1.8 };
const sectionTitle: React.CSSProperties = { marginTop: 0, fontSize: 22, fontWeight: 900 };
const answerButton: React.CSSProperties = { padding: 15, borderRadius: 16, color: "white", border: "1px solid", textAlign: "left", cursor: "pointer", fontWeight: 800 };
const primaryButton: React.CSSProperties = { width: "100%", marginTop: 16, padding: 15, borderRadius: 16, border: "none", background: "linear-gradient(135deg,#2563eb,#38bdf8)", color: "white", fontWeight: 950, cursor: "pointer" };
const statusBox: React.CSSProperties = { marginTop: 14, padding: 14, borderRadius: 16, background: "rgba(59,130,246,0.12)", border: "1px solid rgba(147,197,253,0.18)", color: "#bfdbfe" };
const linkCard: React.CSSProperties = { display: "block", padding: 14, borderRadius: 16, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "white", textDecoration: "none", fontWeight: 800 };
const backLink: React.CSSProperties = { display: "block", maxWidth: 900, margin: "0 auto", color: "#93c5fd", textDecoration: "none", fontWeight: 900 };
