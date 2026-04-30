export default function RewardsPage() {
  return (
    <main className="min-h-screen bg-[#061123] px-4 py-8 text-white">
      <div className="mx-auto max-w-5xl">
        <a href="/" className="text-blue-300 hover:text-blue-200">← Back to KARPY</a>
        <section className="mt-6 rounded-3xl border border-blue-400/20 bg-gradient-to-br from-[#0e1b33] to-[#071426] p-8 shadow-2xl">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-cyan-300">Rewards Hub</p>
          <h1 className="mt-3 text-4xl font-black">How rewards work</h1>
          <p className="mt-4 text-blue-100">KARPY Points reward activity, learning, consistency, and community growth.</p>
        </section>
        <section className="mt-6 grid gap-5 md:grid-cols-2">
          {[
            ["Daily Mining", "Claim once per cooldown and keep your streak alive."],
            ["Learn & Earn", "Read short modules, pass checks, and earn points."],
            ["Quizzes", "Answer from the explanation, not random guessing."],
            ["Games", "Small in-app challenges make the app more active."],
            ["Team", "Invite friends and grow your early community circle."],
            ["Premium later", "Optional upgrades can unlock convenience and cosmetics, not guaranteed profit."],
          ].map(([title, text]) => (
            <div key={title} className="rounded-3xl border border-blue-400/20 bg-[#0d1a2f] p-6">
              <h2 className="text-2xl font-black">{title}</h2>
              <p className="mt-3 text-blue-100">{text}</p>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
