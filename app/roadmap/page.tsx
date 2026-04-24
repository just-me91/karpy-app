export default function RoadmapPage() {
  return <InfoPage title="KARPY Roadmap" eyebrow="Season system" items={[
    "Phase 1: daily mining, streaks, XP, chests, achievements and leaderboard.",
    "Phase 2: referral seasons, badges, founder status and cosmetics.",
    "Phase 3: optional premium, packs and boosts through safe payment links.",
    "Phase 4: community campaigns and partner rewards if the user base grows."
  ]} />;
}

function InfoPage({ title, eyebrow, items }: { title: string; eyebrow: string; items: string[] }) {
  return (
    <main style={page}>
      <section style={card}>
        <div style={pill}>{eyebrow}</div>
        <h1 style={h1}>{title}</h1>
        <p style={p}>KARPY is built as a free reward and progression app. KPY points are used inside the app for progress, rank, boosts and status.</p>
        <div style={{ display: "grid", gap: 12 }}>{items.map((item) => <div key={item} style={row}>{item}</div>)}</div>
        <a href="/" style={button}>Back to dashboard</a>
      </section>
    </main>
  );
}
const page: React.CSSProperties = { minHeight: "100vh", background: "radial-gradient(circle at top,#17335d,#05080f)", color: "white", padding: 24, fontFamily: "Inter, Arial, sans-serif" };
const card: React.CSSProperties = { maxWidth: 860, margin: "0 auto", background: "rgba(16,22,34,0.94)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 24, padding: 28 };
const pill: React.CSSProperties = { display: "inline-block", padding: "8px 12px", borderRadius: 999, background: "rgba(59,130,246,0.16)", color: "#93c5fd", fontWeight: 800 };
const h1: React.CSSProperties = { fontSize: 42, margin: "18px 0 10px", fontWeight: 900 };
const p: React.CSSProperties = { color: "#9db2d0", lineHeight: 1.6, fontSize: 16 };
const row: React.CSSProperties = { padding: 16, borderRadius: 16, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" };
const button: React.CSSProperties = { display: "inline-block", marginTop: 20, padding: "12px 16px", borderRadius: 14, background: "#2563eb", color: "white", textDecoration: "none", fontWeight: 800 };
