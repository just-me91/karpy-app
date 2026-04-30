export default function CommunityPage() {
  return (
    <main className="min-h-screen bg-[#061123] px-4 py-8 text-white">
      <div className="mx-auto max-w-5xl">
        <a href="/" className="text-blue-300 hover:text-blue-200">← Back to KARPY</a>
        <section className="mt-6 rounded-3xl border border-blue-400/20 bg-gradient-to-br from-[#0e1b33] to-[#071426] p-8 shadow-2xl">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-cyan-300">Community Hub</p>
          <h1 className="mt-3 text-4xl font-black">KARPY starts with early adopters</h1>
          <p className="mt-4 text-blue-100">
            This hub is prepared for future Telegram, X, Discord, and community events. For now, users can grow through invite codes, missions, learning, and leaderboard competition.
          </p>
        </section>
        <section className="mt-6 grid gap-5 md:grid-cols-3">
          <div className="rounded-3xl border border-blue-400/20 bg-[#0d1a2f] p-6"><h2 className="text-xl font-black">Early users</h2><p className="mt-3 text-blue-100">Shape future missions and features.</p></div>
          <div className="rounded-3xl border border-blue-400/20 bg-[#0d1a2f] p-6"><h2 className="text-xl font-black">Teams</h2><p className="mt-3 text-blue-100">Invite friends and grow your KARPY circle.</p></div>
          <div className="rounded-3xl border border-blue-400/20 bg-[#0d1a2f] p-6"><h2 className="text-xl font-black">Seasons</h2><p className="mt-3 text-blue-100">Future rankings and events will keep the app active.</p></div>
        </section>
      </div>
    </main>
  );
}
