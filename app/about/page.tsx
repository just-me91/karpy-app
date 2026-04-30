export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#061123] px-4 py-8 text-white">
      <div className="mx-auto max-w-5xl">
        <a href="/" className="text-blue-300 hover:text-blue-200">← Back to KARPY</a>
        <section className="mt-6 rounded-3xl border border-blue-400/20 bg-gradient-to-br from-[#0e1b33] to-[#071426] p-8 shadow-2xl">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-cyan-300">Early Access Ecosystem</p>
          <h1 className="mt-3 text-4xl font-black">What is KARPY?</h1>
          <p className="mt-5 text-lg leading-8 text-blue-100">
            KARPY is an early-stage digital reward ecosystem focused on learning, consistency, and community growth. Users earn KARPY Points by mining daily, completing educational missions, playing small games, and growing their team.
          </p>
          <p className="mt-4 rounded-2xl border border-yellow-300/20 bg-yellow-300/10 p-4 text-yellow-100">
            KARPY Points are in-app progress rewards only. They are not cash payouts, not guaranteed earnings, and not current token withdrawals.
          </p>
        </section>

        <section className="mt-6 grid gap-5 md:grid-cols-3">
          {[
            ["Learn", "Short crypto lessons and safety modules."],
            ["Earn", "KARPY Points for progress, quizzes, and missions."],
            ["Grow", "Team referrals, streaks, levels, and leaderboards."],
          ].map(([title, body]) => (
            <div key={title} className="rounded-3xl border border-blue-400/20 bg-[#0d1a2f] p-6">
              <h2 className="text-2xl font-black">{title}</h2>
              <p className="mt-3 text-blue-100">{body}</p>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
