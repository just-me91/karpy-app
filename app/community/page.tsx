export default function CommunityPage() {
  return (
    <main style={page}>
      <section style={card}>
        <div style={pill}>Community Hub</div>
        <h1 style={h1}>KARPY Community</h1>
        <p style={p}>This page is a safe placeholder until your Telegram/X pages are ready. Users can still understand the community loop without clicking fake social links.</p>
        <div style={row}>Invite active users using your referral code.</div>
        <div style={row}>Climb referral and mining leaderboards.</div>
        <div style={row}>Future: Telegram, X, Discord or newsletter links can be added here.</div>
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
const row: React.CSSProperties = { marginTop: 12, padding: 16, borderRadius: 16, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" };
const button: React.CSSProperties = { display: "inline-block", marginTop: 20, padding: "12px 16px", borderRadius: 14, background: "#2563eb", color: "white", textDecoration: "none", fontWeight: 800 };
