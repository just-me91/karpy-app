"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

type Profile = {
  wallet: string;
  username?: string | null;
  referralCode: string;
  referrals: number;
  balance: number;
  miningLevel: number;
};

function TeamContent() {
  const searchParams = useSearchParams();
  const mission = searchParams.get("mission") || "invite_intro";
  const [profile, setProfile] = useState<Profile | null>(null);
  const [copied, setCopied] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/karpy/profile")
      .then((r) => r.json())
      .then((data) => setProfile(data))
      .catch(() => setError("Could not load profile."));
  }, []);

  const inviteUrl = profile ? `${window.location.origin}/auth?ref=${encodeURIComponent(profile.referralCode)}` : "";

  async function copyInvite() {
    if (!inviteUrl) return;
    await navigator.clipboard.writeText(inviteUrl).catch(() => null);
    setCopied(true);
  }

  async function claimMission() {
    if (claimed) return;
    setError("");
    const res = await fetch("/api/karpy/task/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskId: "team_invite_intro" }),
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
        <section className="mt-6 rounded-3xl border border-emerald-400/20 bg-gradient-to-br from-[#0e1b33] to-[#071426] p-6 shadow-2xl">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-emerald-300">Team Growth</p>
          <h1 className="mt-3 text-4xl font-black">Build your KARPY circle</h1>
          <p className="mt-3 text-blue-100">
            Invite friends into the early ecosystem. KARPY grows through learning, activity, and community — not fake payout promises.
          </p>
        </section>

        <section className="mt-6 grid gap-5 lg:grid-cols-2">
          <div className="rounded-3xl border border-blue-400/20 bg-[#0d1a2f] p-6">
            <h2 className="text-2xl font-black">Your invite code</h2>
            {!profile ? <p className="mt-4 text-blue-100">Loading...</p> : (
              <>
                <div className="mt-5 rounded-2xl border border-blue-400/20 bg-blue-950/50 p-5 text-3xl font-black tracking-wide">{profile.referralCode}</div>
                <div className="mt-4 break-all rounded-2xl bg-blue-500/10 p-4 text-blue-100">{inviteUrl}</div>
                <button onClick={copyInvite} className="mt-5 rounded-2xl bg-blue-500 px-6 py-3 font-black hover:bg-blue-400">{copied ? "Copied" : "Copy Invite Link"}</button>
              </>
            )}
          </div>

          <div className="rounded-3xl border border-blue-400/20 bg-[#0d1a2f] p-6">
            <h2 className="text-2xl font-black">Team stats</h2>
            <div className="mt-5 grid gap-3">
              <div className="rounded-2xl bg-blue-950/50 p-4">Active referrals: <b>{profile?.referrals ?? 0}</b></div>
              <div className="rounded-2xl bg-blue-950/50 p-4">Your level: <b>{profile?.miningLevel ?? 1}</b></div>
              <div className="rounded-2xl bg-blue-950/50 p-4">Points balance: <b>{profile?.balance ?? 0}</b></div>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-3xl border border-blue-400/20 bg-[#0d1a2f] p-6">
          <h2 className="text-2xl font-black">How referrals should work</h2>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl bg-blue-950/50 p-4">1. Friend joins with your code</div>
            <div className="rounded-2xl bg-blue-950/50 p-4">2. They mine and stay active</div>
            <div className="rounded-2xl bg-blue-950/50 p-4">3. You grow your team score</div>
          </div>
          {mission === "invite_intro" && copied && !claimed ? <button onClick={claimMission} className="mt-6 rounded-2xl bg-emerald-500 px-6 py-3 font-black hover:bg-emerald-400">Claim Team Mission Reward</button> : null}
          {mission === "invite_intro" && !copied ? <p className="mt-5 text-blue-100">Copy your invite link to unlock this mission reward.</p> : null}
          {claimed ? <div className="mt-6 rounded-2xl bg-emerald-500/10 p-4 text-emerald-200">✅ Team mission complete. Reward claimed.</div> : null}
          {error ? <div className="mt-6 rounded-2xl bg-yellow-500/10 p-4 text-yellow-100">{error}</div> : null}
        </section>
      </div>
    </main>
  );
}

export default function TeamPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-[#061123] p-8 text-white">Loading KARPY Team...</main>}>
      <TeamContent />
    </Suspense>
  );
}
