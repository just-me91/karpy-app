export default function RoadmapPage() {
  const steps = [
    ["Phase 1", "Daily mining, streaks, points, tasks, and user accounts."],
    ["Phase 2", "Learn & Earn modules, quizzes, mini games, and safer onboarding."],
    ["Phase 3", "Community growth, team missions, seasonal leaderboards, and badges."],
    ["Phase 4", "Optional premium tools, founder perks, cosmetics, and partner rewards."],
    ["Phase 5", "Future marketplace utility and broader ecosystem integrations if the community grows."],
  ];

  return (
    <main className="min-h-screen bg-[#061123] px-4 py-8 text-white">
      <div className="mx-auto max-w-5xl">
        <a href="/" className="text-blue-300 hover:text-blue-200">← Back to KARPY</a>
        <section className="mt-6 rounded-3xl border border-blue-400/20 bg-[#0d1a2f] p-8">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-blue-300">Roadmap</p>
          <h1 className="mt-3 text-4xl font-black">KARPY is early</h1>
          <p className="mt-4 text-blue-100">The goal is to grow from a simple mining app into a learning and reward ecosystem.</p>
        </section>
        <section className="mt-6 grid gap-4">
          {steps.map(([phase, text]) => (
            <div key={phase} className="rounded-3xl border border-blue-400/20 bg-blue-950/40 p-5">
              <h2 className="text-xl font-black text-cyan-200">{phase}</h2>
              <p className="mt-2 text-blue-100">{text}</p>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
