"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

type Task = {
  id: string;
  title: string;
  reward: number;
  done: boolean;
  unlocked?: boolean;
  category?: string;
  description?: string;
  href?: string;
  cta?: string;
};

type Achievement = {
  id: string;
  title: string;
  reward: number;
  unlocked: boolean;
  claimed: boolean;
};

type FounderPack = {
  id: string;
  title: string;
  cost: number;
  rewardBalance: number;
  premiumDays: number;
  boostHours: number;
  boostMultiplier: number;
  purchased: boolean;
};

type MiningProgress = {
  currentLevel: number;
  currentXp: number;
  nextLevel: number | null;
  xpIntoLevel: number;
  xpNeededForNext: number;
  progressPercent: number;
  multiplier: number;
};

type RewardPreview = {
  baseReward: number;
  streakBonus: number;
  holderBonus: number;
  levelMultiplier: number;
  premiumFactor: number;
  boostFactor: number;
  totalReward: number;
};

type ProfileResponse = {
  wallet: string;
  username?: string | null;
  balance: number;
  streak: number;
  referrals: number;
  referralCode: string;
  totalMined: number;
  miningXp: number;
  miningLevel: number;
  miningProgress: MiningProgress;
  rewardPreview: RewardPreview;
  tasks: Task[];
  achievements: Achievement[];
  founderPacks: FounderPack[];
  premiumPerks: string[];
  isPremium: boolean;
  premiumExpiresAt?: string | null;
  boostMultiplier?: number;
  boostExpiresAt?: string | null;
  supply: {
    circulating: number;
    maxSupply: number;
    remaining: number;
  };
  dailyChest: {
    available: boolean;
    nextReward: number;
    secondsRemaining: number;
  };
};

type LeaderboardItem = {
  rank: number;
  wallet: string;
  shortWallet: string;
  balance: number;
  referrals: number;
  totalMined: number;
  miningLevel: number;
};

type LeaderboardType = "mined" | "balance" | "referrals";

function formatTime(seconds: number) {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(
    secs
  ).padStart(2, "0")}`;
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-GB").format(value || 0);
}

function getLeaderboardValue(item: LeaderboardItem, type: LeaderboardType) {
  if (type === "balance") return `${formatNumber(item.balance)} KPY`;
  if (type === "referrals") return `${formatNumber(item.referrals)}`;
  return `${formatNumber(item.totalMined)} KPY`;
}

function getLeaderboardLabel(type: LeaderboardType) {
  if (type === "balance") return "Top Balance";
  if (type === "referrals") return "Top Referrals";
  return "Top Mined";
}

export default function HomePage() {
  const [wallet, setWallet] = useState("");
  const [username, setUsername] = useState("");
  const [balance, setBalance] = useState(0);
  const [streak, setStreak] = useState(0);
  const [referrals, setReferrals] = useState(0);
  const [referralCode, setReferralCode] = useState("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [founderPacks, setFounderPacks] = useState<FounderPack[]>([]);
  const [premiumPerks, setPremiumPerks] = useState<string[]>([]);
  const [totalMined, setTotalMined] = useState(0);
  const [miningXp, setMiningXp] = useState(0);
  const [miningLevel, setMiningLevel] = useState(1);
  const [isPremium, setIsPremium] = useState(false);
  const [premiumExpiresAt, setPremiumExpiresAt] = useState<string | null>(null);
  const [boostMultiplier, setBoostMultiplier] = useState(1);
  const [boostExpiresAt, setBoostExpiresAt] = useState<string | null>(null);

  const [status, setStatus] = useState("Loading profile...");
  const [claimLoading, setClaimLoading] = useState(false);
  const [taskLoading, setTaskLoading] = useState<string | null>(null);
  const [achievementLoading, setAchievementLoading] = useState<string | null>(null);
  const [packLoading, setPackLoading] = useState<string | null>(null);
  const [referralInput, setReferralInput] = useState("");
  const [referralLoading, setReferralLoading] = useState(false);
  const [copyingReferral, setCopyingReferral] = useState(false);
  const [premiumLoading, setPremiumLoading] = useState(false);
  const [boostLoading, setBoostLoading] = useState(false);
  const [chestLoading, setChestLoading] = useState(false);

  const [secondsLeft, setSecondsLeft] = useState(0);
  const [chestSecondsLeft, setChestSecondsLeft] = useState(0);
  const [chestAvailable, setChestAvailable] = useState(false);
  const [chestReward, setChestReward] = useState(0);

  const [rewardPreview, setRewardPreview] = useState<RewardPreview>({
    baseReward: 100,
    streakBonus: 0,
    holderBonus: 0,
    levelMultiplier: 1,
    premiumFactor: 1,
    boostFactor: 1,
    totalReward: 100,
  });

  const [miningProgress, setMiningProgress] = useState<MiningProgress>({
    currentLevel: 1,
    currentXp: 0,
    nextLevel: 2,
    xpIntoLevel: 0,
    xpNeededForNext: 100,
    progressPercent: 0,
    multiplier: 1,
  });

  const [supply, setSupply] = useState({
    circulating: 0,
    maxSupply: 1,
    remaining: 1,
  });

  const [leaderboardType, setLeaderboardType] = useState<LeaderboardType>("mined");
  const [leaderboard, setLeaderboard] = useState<LeaderboardItem[]>([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);

  async function loadProfile() {
    try {
      setStatus("Loading profile...");

      const res = await fetch("/api/karpy/profile", {
        cache: "no-store",
      });

      const data: ProfileResponse | { error: string } = await res.json();

      if (!res.ok || "error" in data) {
        setStatus(("error" in data ? data.error : "Failed to load profile") || "Failed to load profile");
        if (res.status === 401) {
          window.location.href = "/auth";
        }
        return;
      }

      setWallet(data.wallet);
      setUsername(data.username || "");
      setBalance(data.balance);
      setStreak(data.streak);
      setReferrals(data.referrals);
      setReferralCode(data.referralCode);
      setTasks(data.tasks);
      setAchievements(data.achievements);
      setFounderPacks(data.founderPacks);
      setPremiumPerks(data.premiumPerks);
      setTotalMined(data.totalMined);
      setMiningXp(data.miningXp);
      setMiningLevel(data.miningLevel);
      setMiningProgress(data.miningProgress);
      setRewardPreview(data.rewardPreview);
      setIsPremium(data.isPremium);
      setPremiumExpiresAt(data.premiumExpiresAt || null);
      setBoostMultiplier(data.boostMultiplier || 1);
      setBoostExpiresAt(data.boostExpiresAt || null);
      setSupply(data.supply);
      setChestAvailable(data.dailyChest.available);
      setChestSecondsLeft(data.dailyChest.secondsRemaining);
      setChestReward(data.dailyChest.nextReward);
      setStatus("Profile loaded successfully");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Profile load failed";
      setStatus(message);
    }
  }

  async function loadLeaderboard(type: LeaderboardType = leaderboardType) {
    try {
      setLeaderboardLoading(true);
      const res = await fetch(`/api/karpy/leaderboard?type=${type}&limit=10`);
      const data = await res.json();

      if (!res.ok) return;
      setLeaderboard(data.items || []);
    } catch {
      //
    } finally {
      setLeaderboardLoading(false);
    }
  }

  async function handleClaim() {
    try {
      setClaimLoading(true);
      setStatus("Mining KARPY...");

      const res = await fetch("/api/karpy/claim", {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus(data.error || "Claim failed");
        if (typeof data.secondsRemaining === "number") {
          setSecondsLeft(data.secondsRemaining);
        }
        return;
      }

      setStatus(`Mining successful: +${data.reward} KPY`);
      setSecondsLeft(data.secondsRemaining ?? 24 * 60 * 60);

      await loadProfile();
      await loadLeaderboard(leaderboardType);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Claim failed";
      setStatus(message);
    } finally {
      setClaimLoading(false);
    }
  }

  async function completeTask(taskId: string) {
    try {
      setTaskLoading(taskId);
      setStatus(`Completing task ${taskId}...`);

      const res = await fetch("/api/karpy/task/complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ taskId }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus(data.error || "Task failed");
        return;
      }

      setStatus(`Task completed: +${data.reward} KPY`);
      await loadProfile();
      await loadLeaderboard(leaderboardType);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Task failed";
      setStatus(message);
    } finally {
      setTaskLoading(null);
    }
  }

  async function claimAchievement(achievementId: string) {
    try {
      setAchievementLoading(achievementId);
      setStatus(`Claiming achievement ${achievementId}...`);

      const res = await fetch("/api/karpy/achievement/claim", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ achievementId }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus(data.error || "Achievement failed");
        return;
      }

      setStatus(`Achievement claimed: +${data.reward} KPY`);
      await loadProfile();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Achievement failed";
      setStatus(message);
    } finally {
      setAchievementLoading(null);
    }
  }

  async function claimChest() {
    try {
      setChestLoading(true);
      setStatus("Opening daily chest...");

      const res = await fetch("/api/karpy/daily-chest/claim", {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus(data.error || "Daily chest failed");
        if (typeof data.secondsRemaining === "number") {
          setChestSecondsLeft(data.secondsRemaining);
          setChestAvailable(false);
        }
        return;
      }

      setStatus(`Daily chest opened: +${data.reward} KPY`);
      setChestAvailable(false);
      setChestSecondsLeft(data.secondsRemaining ?? 24 * 60 * 60);
      await loadProfile();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Daily chest failed";
      setStatus(message);
    } finally {
      setChestLoading(false);
    }
  }

  async function applyReferral() {
    try {
      if (!referralInput.trim()) {
        setStatus("Enter a referral code first");
        return;
      }

      setReferralLoading(true);
      setStatus("Applying referral...");

      const res = await fetch("/api/karpy/referral/apply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code: referralInput.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus(data.error || "Referral failed");
        return;
      }

      setStatus(data.message || "Referral applied");
      setReferralInput("");
      await loadProfile();
      await loadLeaderboard(leaderboardType);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Referral failed";
      setStatus(message);
    } finally {
      setReferralLoading(false);
    }
  }

  async function copyReferralCode() {
    try {
      if (!referralCode) return;
      setCopyingReferral(true);
      await navigator.clipboard.writeText(referralCode);
      setStatus("Referral code copied");
    } catch {
      setStatus("Could not copy referral code");
    } finally {
      setCopyingReferral(false);
    }
  }

  async function buyPremium() {
    try {
      setPremiumLoading(true);
      setStatus("Activating premium...");

      const res = await fetch("/api/karpy/premium/apply", {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus(data.error || "Premium failed");
        return;
      }

      setStatus(data.message || "Premium active");
      await loadProfile();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Premium failed";
      setStatus(message);
    } finally {
      setPremiumLoading(false);
    }
  }

  async function buyBoost() {
    try {
      setBoostLoading(true);
      setStatus("Activating x2 boost...");

      const res = await fetch("/api/karpy/boost/apply", {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus(data.error || "Boost failed");
        return;
      }

      setStatus(data.message || "Boost active");
      await loadProfile();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Boost failed";
      setStatus(message);
    } finally {
      setBoostLoading(false);
    }
  }

  async function buyFounderPack(packId: string) {
    try {
      setPackLoading(packId);
      setStatus(`Activating ${packId} pack...`);

      const res = await fetch("/api/karpy/founder-pack/apply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ packId }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus(data.error || "Founder pack failed");
        return;
      }

      setStatus(data.message || "Founder pack active");
      await loadProfile();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Founder pack failed";
      setStatus(message);
    } finally {
      setPackLoading(null);
    }
  }

  async function logout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/auth";
    } catch {
      setStatus("Logout failed");
    }
  }

  useEffect(() => {
    loadProfile();
    loadLeaderboard("mined");
  }, []);

  useEffect(() => {
    loadLeaderboard(leaderboardType);
  }, [leaderboardType]);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [secondsLeft]);

  useEffect(() => {
    if (chestSecondsLeft <= 0) return;
    const timer = setInterval(() => {
      setChestSecondsLeft((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [chestSecondsLeft]);

  const pendingTasks = useMemo(() => tasks.filter((t) => !t.done).length, [tasks]);
  const completedTasks = useMemo(() => tasks.filter((t) => t.done).length, [tasks]);
  const totalPreviewReward = rewardPreview.totalReward;
  const canMine = !claimLoading && secondsLeft === 0;
  const claimableAchievements = useMemo(
    () => achievements.filter((a) => a.unlocked && !a.claimed).length,
    [achievements]
  );

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top, #17335d 0%, #0a1220 30%, #05080f 100%)",
        color: "white",
        padding: 24,
        fontFamily: "Inter, Arial, sans-serif",
      }}
    >
      <div style={{ maxWidth: 1240, margin: "0 auto" }}>
        <div
          style={{
            marginBottom: 24,
            padding: 24,
            borderRadius: 28,
            border: "1px solid rgba(120,180,255,0.12)",
            background:
              "linear-gradient(135deg, rgba(22,40,76,0.95), rgba(8,16,30,0.95))",
            boxShadow: "0 30px 80px rgba(0,0,0,0.35)",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(320px, 420px) 1fr",
              gap: 24,
              alignItems: "center",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  width: 280,
                  height: 280,
                  borderRadius: "50%",
                  padding: 12,
                  background:
                    "linear-gradient(145deg, rgba(96,165,250,0.25), rgba(29,78,216,0.1))",
                  boxShadow:
                    "0 0 0 2px rgba(96,165,250,0.14), 0 20px 60px rgba(37,99,235,0.35), inset 0 0 40px rgba(255,255,255,0.04)",
                }}
              >
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: "50%",
                    overflow: "hidden",
                    position: "relative",
                    background: "#0b1220",
                  }}
                >
                  <Image
                    src="/karpy-logo.jpg"
                    alt="KARPY logo"
                    fill
                    sizes="280px"
                    style={{ objectFit: "cover" }}
                    priority
                  />
                </div>
              </div>
            </div>

            <div>
              <div
                style={{
                  display: "inline-block",
                  fontSize: 12,
                  letterSpacing: 1,
                  textTransform: "uppercase",
                  padding: "8px 12px",
                  borderRadius: 999,
                  background: "rgba(59,130,246,0.12)",
                  color: "#93c5fd",
                  border: "1px solid rgba(96,165,250,0.18)",
                  marginBottom: 14,
                }}
              >
                KARPY Growth Dashboard
              </div>

              <h1
                style={{
                  fontSize: 48,
                  lineHeight: 1.05,
                  margin: 0,
                  fontWeight: 900,
                  letterSpacing: -1,
                }}
              >
                Mine KARPY.
                <br />
                Build Your Rank.
              </h1>

              <p
                style={{
                  color: "#9db2d0",
                  fontSize: 17,
                  maxWidth: 700,
                  marginTop: 14,
                  marginBottom: 20,
                  lineHeight: 1.6,
                }}
              >
                Daily mining, chest rewards, achievements, founder packs, premium
                perks and progression designed to keep users active and buying upgrades.
              </p>

              <div
                style={{
                  display: "flex",
                  gap: 14,
                  flexWrap: "wrap",
                }}
              >
                <MiniPill label="Wallet" value={wallet} />
                <MiniPill label="User" value={username || "-"} />
                <MiniPill label="Balance" value={`${formatNumber(balance)} KPY`} />
                <MiniPill label="Level" value={`${miningLevel}`} />
                <MiniPill label="Premium" value={isPremium ? "YES" : "NO"} />
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "360px 1fr",
            gap: 20,
            alignItems: "start",
          }}
        >
          <div style={{ display: "grid", gap: 20 }}>
            <section style={minePanel}>
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    color: "#8fa4c4",
                    fontSize: 13,
                    marginBottom: 10,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                  }}
                >
                  Daily Mining Core
                </div>

                <button
                  onClick={handleClaim}
                  disabled={!canMine}
                  style={{
                    ...mineLogoButton,
                    opacity: canMine ? 1 : 0.72,
                    cursor: canMine ? "pointer" : "not-allowed",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      borderRadius: "50%",
                      overflow: "hidden",
                    }}
                  >
                    <Image
                      src="/karpy-logo.jpg"
                      alt="Mine KARPY"
                      fill
                      sizes="240px"
                      style={{ objectFit: "cover" }}
                      priority
                    />
                  </div>

                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      borderRadius: "50%",
                      background:
                        "radial-gradient(circle at center, rgba(255,255,255,0.06) 0%, rgba(0,0,0,0.18) 55%, rgba(0,0,0,0.42) 100%)",
                    }}
                  />

                  <div
                    style={{
                      position: "relative",
                      zIndex: 2,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      textShadow: "0 3px 10px rgba(0,0,0,0.55)",
                    }}
                  >
                    <div style={{ fontSize: 24, fontWeight: 900 }}>
                      {claimLoading ? "MINING..." : secondsLeft > 0 ? "COOLDOWN" : "MINE"}
                    </div>
                    <div style={{ fontSize: 12, marginTop: 6, opacity: 0.95 }}>
                      {secondsLeft > 0 ? formatTime(secondsLeft) : "Tap logo to earn"}
                    </div>
                  </div>
                </button>

                <div
                  style={{
                    marginTop: 16,
                    fontSize: 15,
                    color: "#9fc3ff",
                  }}
                >
                  Next total reward: <strong>{formatNumber(totalPreviewReward)} KPY</strong>
                </div>
              </div>
            </section>

            <section style={leftCard}>
              <h2 style={sectionTitle}>Daily Chest</h2>

              <RewardRow label="Next chest reward" value={`${formatNumber(chestReward)} KPY`} />
              <RewardRow
                label="Chest status"
                value={chestAvailable ? "Ready" : formatTime(chestSecondsLeft)}
              />

              <button
                style={{ ...primaryButton, marginTop: 12 }}
                onClick={claimChest}
                disabled={!chestAvailable || chestLoading}
              >
                {chestLoading ? "Opening..." : chestAvailable ? "Open Daily Chest" : "Chest Cooling Down"}
              </button>
            </section>

            <section style={leftCard}>
              <h2 style={sectionTitle}>Reward Breakdown</h2>

              <div style={{ display: "grid", gap: 10 }}>
                <RewardRow label="Base reward" value={`${formatNumber(rewardPreview.baseReward)} KPY`} />
                <RewardRow label="Streak bonus" value={`${formatNumber(rewardPreview.streakBonus)} KPY`} />
                <RewardRow label="Holder bonus" value={`${formatNumber(rewardPreview.holderBonus)} KPY`} />
                <RewardRow label="Level multiplier" value={`x${rewardPreview.levelMultiplier.toFixed(2)}`} />
                <RewardRow label="Premium factor" value={`x${rewardPreview.premiumFactor.toFixed(2)}`} />
                <RewardRow label="Boost factor" value={`x${rewardPreview.boostFactor.toFixed(2)}`} />
                <RewardRow label="Total next reward" value={`${formatNumber(totalPreviewReward)} KPY`} strong />
              </div>
            </section>

            <section style={leftCard}>
              <h2 style={sectionTitle}>Referral</h2>
              <div style={{ color: "#8fa4c4", marginBottom: 8, fontSize: 14 }}>Your code</div>

              <div style={codeBox}>{referralCode || "-"}</div>

              <button
                style={{ ...secondaryButton, marginBottom: 12 }}
                onClick={copyReferralCode}
                disabled={!referralCode || copyingReferral}
              >
                {copyingReferral ? "Copying..." : "Copy Referral Code"}
              </button>

              <input
                value={referralInput}
                onChange={(e) => setReferralInput(e.target.value)}
                placeholder="Enter referral code"
                style={inputStyle}
              />

              <button
                style={primaryButton}
                onClick={applyReferral}
                disabled={referralLoading}
              >
                {referralLoading ? "Applying..." : "Apply Referral"}
              </button>
            </section>

            <section style={leftCard}>
              <h2 style={sectionTitle}>Premium Store</h2>

              <RewardRow label="Premium 30 days" value="5000 KPY" />
              <button style={primaryButton} onClick={buyPremium} disabled={premiumLoading}>
                {premiumLoading ? "Activating..." : "Buy Premium"}
              </button>

              <div style={{ height: 10 }} />

              <RewardRow label="x2 Boost 24h" value="1000 KPY" />
              <button style={primaryButton} onClick={buyBoost} disabled={boostLoading}>
                {boostLoading ? "Activating..." : "Buy x2 Boost"}
              </button>

              <div style={{ marginTop: 14 }}>
                <RewardRow label="Premium active" value={isPremium ? "YES" : "NO"} />
                <RewardRow label="Premium expires" value={premiumExpiresAt || "-"} />
                <RewardRow label="Boost expires" value={boostExpiresAt || "-"} />
              </div>
            </section>

            <section style={leftCard}>
              <h2 style={sectionTitle}>Premium Perks</h2>
              <div style={{ display: "grid", gap: 10 }}>
                {premiumPerks.map((perk) => (
                  <RewardRow key={perk} label="Perk" value={perk} />
                ))}
              </div>
            </section>

            <section style={leftCard}>
              <h2 style={sectionTitle}>Account</h2>
              <button
                style={{ ...secondaryButton, marginBottom: 10 }}
                onClick={() => {
                  window.location.href = "/auth";
                }}
              >
                Auth Page
              </button>

              <button style={secondaryButton} onClick={logout}>
                Logout
              </button>
            </section>
          </div>

          <div style={{ display: "grid", gap: 20 }}>
            <section style={rightCard}>
              <h2 style={sectionTitle}>Mining Overview</h2>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                  gap: 14,
                }}
              >
                <StatCard label="Balance" value={`${formatNumber(balance)}`} accent="#60a5fa" />
                <StatCard label="Total Mined" value={`${formatNumber(totalMined)}`} accent="#f59e0b" />
                <StatCard label="Referrals" value={`${formatNumber(referrals)}`} accent="#34d399" />
                <StatCard label="Tasks Left" value={`${pendingTasks}`} accent="#f472b6" />
                <StatCard label="Tasks Done" value={`${completedTasks}`} accent="#a78bfa" />
                <StatCard label="Achievements" value={`${claimableAchievements}`} accent="#22d3ee" />
              </div>
            </section>

            <section style={rightCard}>
              <h2 style={sectionTitle}>Mining Level</h2>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "220px 1fr",
                  gap: 20,
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    borderRadius: 22,
                    padding: 20,
                    background:
                      "linear-gradient(135deg, rgba(59,130,246,0.16), rgba(14,165,233,0.08))",
                    border: "1px solid rgba(96,165,250,0.18)",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: 13,
                      textTransform: "uppercase",
                      letterSpacing: 1,
                      color: "#8fa4c4",
                      marginBottom: 12,
                    }}
                  >
                    Current Level
                  </div>
                  <div style={{ fontSize: 54, fontWeight: 900, color: "#93c5fd" }}>
                    {miningLevel}
                  </div>
                  <div style={{ marginTop: 8, color: "#dbeafe" }}>
                    Multiplier x{miningProgress.multiplier.toFixed(2)}
                  </div>
                </div>

                <div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 12,
                      marginBottom: 10,
                      color: "#cbd5e1",
                    }}
                  >
                    <span>Level progress</span>
                    <strong>{miningProgress.progressPercent}%</strong>
                  </div>

                  <div
                    style={{
                      height: 16,
                      width: "100%",
                      borderRadius: 999,
                      background: "rgba(255,255,255,0.08)",
                      overflow: "hidden",
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${miningProgress.progressPercent}%`,
                        borderRadius: 999,
                        background: "linear-gradient(90deg, #38bdf8, #60a5fa, #818cf8)",
                        boxShadow: "0 0 20px rgba(96,165,250,0.35)",
                        transition: "width 0.35s ease",
                      }}
                    />
                  </div>

                  <div
                    style={{
                      marginTop: 14,
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                      gap: 12,
                    }}
                  >
                    <InfoChip label="Current XP" value={`${formatNumber(miningProgress.currentXp)}`} />
                    <InfoChip label="Next Level" value={miningProgress.nextLevel ? `Level ${miningProgress.nextLevel}` : "Max"} />
                    <InfoChip label="XP In Level" value={`${formatNumber(miningProgress.xpIntoLevel)}`} />
                    <InfoChip label="XP Needed" value={`${formatNumber(miningProgress.xpNeededForNext)}`} />
                  </div>
                </div>
              </div>
            </section>

            <section style={rightCard}>
              <h2 style={sectionTitle}>Supply</h2>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                  gap: 14,
                }}
              >
                <StatCard label="Circulating" value={`${formatNumber(supply.circulating)}`} accent="#38bdf8" />
                <StatCard label="Max Supply" value={`${formatNumber(supply.maxSupply)}`} accent="#a78bfa" />
                <StatCard label="Remaining" value={`${formatNumber(supply.remaining)}`} accent="#34d399" />
              </div>
            </section>

            <section style={rightCard}>
              <h2 style={sectionTitle}>Founder Packs</h2>

              <div style={{ display: "grid", gap: 12 }}>
                {founderPacks.map((pack) => (
                  <div key={pack.id} style={taskRow}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 18 }}>{pack.title}</div>
                      <div style={{ color: "#8fa4c4", marginTop: 4 }}>
                        Cost: {formatNumber(pack.cost)} KPY • Reward: {formatNumber(pack.rewardBalance)} KPY • Premium: {pack.premiumDays}d • Boost: x{pack.boostMultiplier} for {pack.boostHours}h
                      </div>
                    </div>

                    <button
                      style={{
                        ...taskButton,
                        opacity: pack.purchased ? 0.7 : 1,
                        cursor: pack.purchased ? "not-allowed" : "pointer",
                      }}
                      disabled={pack.purchased || packLoading === pack.id}
                      onClick={() => buyFounderPack(pack.id)}
                    >
                      {pack.purchased
                        ? "Owned"
                        : packLoading === pack.id
                        ? "Buying..."
                        : "Buy Pack"}
                    </button>
                  </div>
                ))}
              </div>
            </section>

            <section style={rightCard}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 16,
                  flexWrap: "wrap",
                  marginBottom: 16,
                }}
              >
                <h2 style={{ ...sectionTitle, marginBottom: 0 }}>Leaderboard</h2>

                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <TabButton active={leaderboardType === "mined"} onClick={() => setLeaderboardType("mined")}>
                    Mined
                  </TabButton>
                  <TabButton active={leaderboardType === "balance"} onClick={() => setLeaderboardType("balance")}>
                    Balance
                  </TabButton>
                  <TabButton active={leaderboardType === "referrals"} onClick={() => setLeaderboardType("referrals")}>
                    Referrals
                  </TabButton>
                </div>
              </div>

              <div style={{ color: "#8fa4c4", marginBottom: 14, fontSize: 14 }}>
                {leaderboardLoading ? "Loading leaderboard..." : getLeaderboardLabel(leaderboardType)}
              </div>

              <div style={{ display: "grid", gap: 12 }}>
                {leaderboard.map((item) => (
                  <div key={`${leaderboardType}-${item.wallet}`} style={leaderboardRow}>
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <div style={rankBadge}>#{item.rank}</div>

                      <div>
                        <div style={{ fontWeight: 800, fontSize: 17 }}>{item.shortWallet}</div>
                        <div style={{ color: "#8fa4c4", marginTop: 4, fontSize: 13 }}>
                          Level {item.miningLevel}
                        </div>
                      </div>
                    </div>

                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontWeight: 900, fontSize: 18 }}>
                        {getLeaderboardValue(item, leaderboardType)}
                      </div>
                      <div style={{ color: "#8fa4c4", marginTop: 4, fontSize: 13 }}>
                        Balance: {formatNumber(item.balance)} KPY
                      </div>
                    </div>
                  </div>
                ))}

                {!leaderboardLoading && leaderboard.length === 0 ? (
                  <div style={emptyBox}>No leaderboard data yet.</div>
                ) : null}
              </div>
            </section>

            <section style={rightCard}>
              <h2 style={sectionTitle}>Missions</h2>

              <div style={{ color: "#8fa4c4", marginBottom: 16, lineHeight: 1.6 }}>
                KARPY Points are in-app rewards for progress, games, learning and status. They are not a payout promise and have no guaranteed monetary value.
              </div>

              <div style={{ display: "grid", gap: 12 }}>
                {tasks.map((task) => {
                  const unlocked = task.unlocked !== false;
                  const canStart = !task.done && unlocked;

                  return (
                    <div key={task.id} style={taskRow}>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                          <div style={{ fontWeight: 900, fontSize: 18 }}>{task.title}</div>
                          {task.category ? <span style={missionBadge}>{task.category}</span> : null}
                        </div>

                        <div style={{ color: "#8fa4c4", marginTop: 6, lineHeight: 1.5 }}>
                          {task.description || "Complete this mission to earn KARPY Points."}
                        </div>

                        <div style={{ color: "#bfdbfe", marginTop: 8, fontWeight: 800 }}>
                          Reward: {formatNumber(task.reward)} KARPY Points
                        </div>
                      </div>

                      <button
                        style={{
                          ...taskButton,
                          opacity: task.done || !unlocked ? 0.7 : 1,
                          cursor: task.done || !unlocked ? "not-allowed" : "pointer",
                          minWidth: 136,
                        }}
                        disabled={task.done || !unlocked}
                        onClick={() => {
                          if (task.href) {
                            window.location.href = task.href;
                            return;
                          }
                          completeTask(task.id);
                        }}
                      >
                        {task.done ? "Done" : !unlocked ? "Locked" : task.cta || "Start"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>


            <section style={rightCard}>
              <h2 style={sectionTitle}>Achievements</h2>

              <div style={{ display: "grid", gap: 12 }}>
                {achievements.map((achievement) => (
                  <div key={achievement.id} style={taskRow}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 18 }}>{achievement.title}</div>
                      <div style={{ color: "#8fa4c4", marginTop: 4 }}>
                        Reward: {formatNumber(achievement.reward)} KPY
                      </div>
                    </div>

                    <button
                      style={{
                        ...taskButton,
                        opacity: achievement.claimed || !achievement.unlocked ? 0.7 : 1,
                        cursor: achievement.claimed || !achievement.unlocked ? "not-allowed" : "pointer",
                      }}
                      disabled={achievement.claimed || !achievement.unlocked || achievementLoading === achievement.id}
                      onClick={() => claimAchievement(achievement.id)}
                    >
                      {achievement.claimed
                        ? "Claimed"
                        : !achievement.unlocked
                        ? "Locked"
                        : achievementLoading === achievement.id
                        ? "Claiming..."
                        : "Claim"}
                    </button>
                  </div>
                ))}
              </div>
            </section>

            <section style={rightCard}>
              <h2 style={sectionTitle}>Status</h2>
              <div style={statusBox}>{status}</div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}

function MiniPill({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div
      style={{
        padding: "10px 14px",
        borderRadius: 999,
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <span style={{ color: "#8fa4c4", marginRight: 8 }}>{label}:</span>
      <strong>{value}</strong>
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: 18,
        padding: 18,
      }}
    >
      <div
        style={{
          color: "#8fa4c4",
          fontSize: 13,
          textTransform: "uppercase",
          letterSpacing: 1,
          marginBottom: 10,
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: 30, fontWeight: 900, color: accent }}>{value}</div>
    </div>
  );
}

function RewardRow({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: 12,
        padding: "12px 14px",
        borderRadius: 14,
        background: strong ? "rgba(59,130,246,0.12)" : "rgba(255,255,255,0.03)",
        border: strong
          ? "1px solid rgba(59,130,246,0.18)"
          : "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <span style={{ color: "#8fa4c4" }}>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function InfoChip({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div
      style={{
        padding: "12px 14px",
        borderRadius: 14,
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div style={{ color: "#8fa4c4", fontSize: 12, marginBottom: 6 }}>{label}</div>
      <div style={{ fontWeight: 800 }}>{value}</div>
    </div>
  );
}

function TabButton({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "10px 14px",
        borderRadius: 999,
        border: active
          ? "1px solid rgba(96,165,250,0.35)"
          : "1px solid rgba(255,255,255,0.08)",
        background: active ? "rgba(59,130,246,0.18)" : "rgba(255,255,255,0.04)",
        color: active ? "#dbeafe" : "white",
        fontWeight: 800,
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}

const leftCard: React.CSSProperties = {
  background: "rgba(16,22,34,0.94)",
  border: "1px solid rgba(255,255,255,0.06)",
  borderRadius: 22,
  padding: 20,
  boxShadow: "0 12px 30px rgba(0,0,0,0.22)",
};

const rightCard: React.CSSProperties = {
  background: "rgba(16,22,34,0.94)",
  border: "1px solid rgba(255,255,255,0.06)",
  borderRadius: 22,
  padding: 22,
  boxShadow: "0 12px 30px rgba(0,0,0,0.22)",
};

const minePanel: React.CSSProperties = {
  background:
    "radial-gradient(circle at top, rgba(59,130,246,0.25), rgba(17,24,39,0.98) 60%)",
  border: "1px solid rgba(96,165,250,0.15)",
  borderRadius: 28,
  padding: 24,
  boxShadow: "0 18px 40px rgba(37,99,235,0.22)",
};

const sectionTitle: React.CSSProperties = {
  marginTop: 0,
  marginBottom: 16,
  fontSize: 24,
  fontWeight: 900,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "14px 14px",
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(7,10,16,0.9)",
  color: "white",
  marginBottom: 12,
  outline: "none",
};

const primaryButton: React.CSSProperties = {
  width: "100%",
  padding: "13px 16px",
  borderRadius: 14,
  border: "none",
  background: "linear-gradient(135deg, #2563eb, #3b82f6)",
  color: "white",
  fontWeight: 800,
  cursor: "pointer",
  boxShadow: "0 12px 26px rgba(37,99,235,0.28)",
};

const secondaryButton: React.CSSProperties = {
  width: "100%",
  padding: "13px 16px",
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(255,255,255,0.04)",
  color: "white",
  fontWeight: 800,
  cursor: "pointer",
};

const mineLogoButton: React.CSSProperties = {
  width: 240,
  height: 240,
  borderRadius: "50%",
  border: "2px solid rgba(147,197,253,0.22)",
  background: "transparent",
  position: "relative",
  overflow: "hidden",
  cursor: "pointer",
  boxShadow:
    "inset 0 10px 25px rgba(255,255,255,0.08), inset 0 -20px 30px rgba(0,0,0,0.35), 0 22px 50px rgba(37,99,235,0.35), 0 0 40px rgba(59,130,246,0.25)",
};

const taskRow: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 16,
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.06)",
  padding: 16,
  borderRadius: 16,
};

const taskButton: React.CSSProperties = {
  padding: "12px 18px",
  borderRadius: 14,
  border: "none",
  background: "linear-gradient(135deg, #2563eb, #3b82f6)",
  color: "white",
  fontWeight: 800,
};

const missionBadge: React.CSSProperties = {
  padding: "5px 9px",
  borderRadius: 999,
  background: "rgba(59,130,246,0.16)",
  border: "1px solid rgba(147,197,253,0.20)",
  color: "#bfdbfe",
  fontSize: 12,
  fontWeight: 900,
};

const statusBox: React.CSSProperties = {
  padding: 16,
  borderRadius: 16,
  background: "rgba(59,130,246,0.08)",
  border: "1px solid rgba(59,130,246,0.16)",
  color: "#bfdbfe",
  minHeight: 80,
  display: "flex",
  alignItems: "center",
};

const codeBox: React.CSSProperties = {
  padding: 14,
  borderRadius: 14,
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.07)",
  fontWeight: 900,
  fontSize: 20,
  marginBottom: 12,
  wordBreak: "break-word",
};

const leaderboardRow: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 16,
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.06)",
  padding: 16,
  borderRadius: 16,
};

const rankBadge: React.CSSProperties = {
  minWidth: 52,
  height: 52,
  borderRadius: 16,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "linear-gradient(135deg, rgba(59,130,246,0.2), rgba(14,165,233,0.12))",
  border: "1px solid rgba(96,165,250,0.18)",
  fontWeight: 900,
  color: "#dbeafe",
};

const emptyBox: React.CSSProperties = {
  padding: 18,
  borderRadius: 16,
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.06)",
  color: "#8fa4c4",
};