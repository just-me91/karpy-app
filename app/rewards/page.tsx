export default function RewardsPage() {
  return (
    <main style={page}>
      <section style={card}>
        <div style={pill}>Rewards Hub</div>
        <h1 style={h1}>How KPY Rewards Work</h1>
        <p style={p}>KPY is an in-app point system. Users collect it through daily mining, chests, missions, streaks and referrals.</p>
        <div style={grid}>
          <Box title="Mine" text="Claim daily KPY and XP." />
          <Box title="Streak" text="Return daily for better bonuses." />
          <Box title="Chest" text="Open daily chests for bonus KPY." />
          <Box title="Rank" text="Use XP and referrals to climb leaderboards." />
          <Box title="Premium" text="Optional speed/status upgrade later." />
          <Box title="No payout" text="KPY has no guaranteed monetary value." />
        </div>
        <a href="/" style={button}>Back to dashboard</a>
      </section>
    </main>
  );
}
function Box({ title, text }: { title: string; text: string }) { return <div style={box}><strong>{title}</strong><p style={{ color: "#9db2d0" }}>{text}</p></div>; }
const page: React.CSSProperties = { minHeight: "100vh", background: "radial-gradient(circle at top,#17335d,#05080f)", color: "white", padding: 24, fontFamily: "Inter, Arial, sans-serif" };
const card: React.CSSProperties = { maxWidth: 980, margin: "0 auto", background: "rgba(16,22,34,0.94)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 24, padding: 28 };
const pill: React.CSSProperties = { display: "inline-block", padding: "8px 12px", borderRadius: 999, background: "rgba(59,130,246,0.16)", color: "#93c5fd", fontWeight: 800 };
const h1: React.CSSProperties = { fontSize: 42, margin: "18px 0 10px", fontWeight: 900 };
const p: React.CSSProperties = { color: "#9db2d0", lineHeight: 1.6, fontSize: 16 };
const grid: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 14, marginTop: 20 };
const box: React.CSSProperties = { padding: 18, borderRadius: 18, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" };
const button: React.CSSProperties = { display: "inline-block", marginTop: 20, padding: "12px 16px", borderRadius: 14, background: "#2563eb", color: "white", textDecoration: "none", fontWeight: 800 };
