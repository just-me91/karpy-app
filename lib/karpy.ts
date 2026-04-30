type KarpyUserShape = {
  balance: number;
  streak: number;
  referrals: number;
  totalMined: number;
  miningXp: number;
  miningLevel: number;
  isPremium?: boolean | null;
  premiumExpiresAt?: Date | string | null;
  boostMultiplier?: number | null;
  boostExpiresAt?: Date | string | null;
};

export const APP_NAME = "KARPY";
export const POINTS_NAME = "KARPY Points";
export const APP_NOTICE =
  "KARPY is an early-stage digital reward ecosystem. KARPY Points are in-app progress rewards only and are not cash payouts or token withdrawals.";

export const BASE_DAILY_REWARD = 70;
export const XP_PER_CLAIM = 15;
export const XP_PER_TASK = 20;
export const REFERRAL_REWARD_NEW_USER = 75;
export const REFERRAL_REWARD_OWNER = 200;

export const PREMIUM_COST_KPY = 5000;
export const BOOST_X2_COST_KPY = 1200;

export type KarpyTaskCategory = "daily" | "learn" | "quiz" | "game" | "team" | "progress";

export const TASKS = [
  {
    id: "learn_crypto_basics",
    title: "Learn: Crypto Basics",
    reward: 140,
    category: "learn",
    href: "/learn?mission=crypto_basics",
    description: "Read a short lesson about crypto basics and pass the mini-check.",
    cta: "Start Lesson",
  },
  {
    id: "learn_wallet_safety",
    title: "Learn: Wallet Safety",
    reward: 160,
    category: "learn",
    href: "/learn?mission=wallet_safety",
    description: "Learn seed phrase safety, fake links, and wallet protection.",
    cta: "Start Lesson",
  },
  {
    id: "learn_risk_management",
    title: "Learn: Risk Management",
    reward: 160,
    category: "learn",
    href: "/learn?mission=risk_management",
    description: "Understand risk, hype, DYOR, and why guaranteed profit claims are dangerous.",
    cta: "Start Lesson",
  },
  {
    id: "learn_karpy_points",
    title: "Learn: What are KARPY Points?",
    reward: 120,
    category: "learn",
    href: "/learn?mission=karpy_points",
    description: "Understand the KARPY ecosystem, points, levels, and early access roadmap.",
    cta: "Start Lesson",
  },
  {
    id: "quiz_daily_crypto",
    title: "Daily Crypto Quiz",
    reward: 180,
    category: "quiz",
    href: "/quiz?mission=daily_crypto_quiz",
    description: "Answer questions based on short explanations and earn points.",
    cta: "Take Quiz",
  },
  {
    id: "quiz_safety",
    title: "Wallet Safety Quiz",
    reward: 180,
    category: "quiz",
    href: "/quiz?mission=safety_quiz",
    description: "Test your knowledge about scams, links, and seed phrases.",
    cta: "Take Quiz",
  },
  {
    id: "game_tap_reactor",
    title: "Game: Tap Reactor",
    reward: 120,
    category: "game",
    href: "/games?mission=tap_reactor",
    description: "Charge the KARPY reactor by tapping and claim your reward.",
    cta: "Play",
  },
  {
    id: "game_memory_match",
    title: "Game: Memory Match",
    reward: 160,
    category: "game",
    href: "/games?mission=memory_match",
    description: "Match crypto concepts in a simple memory challenge.",
    cta: "Play",
  },
  {
    id: "game_risk_choice",
    title: "Game: Risk Choice",
    reward: 150,
    category: "game",
    href: "/games?mission=risk_choice",
    description: "Pick safer choices and learn why risk matters.",
    cta: "Play",
  },
  {
    id: "team_invite_intro",
    title: "Team: Copy your invite code",
    reward: 100,
    category: "team",
    href: "/team?mission=invite_intro",
    description: "Open your team hub, copy your code, and understand referrals.",
    cta: "Open Team",
  },
  {
    id: "streak_3_task",
    title: "Progress: Reach 3 day streak",
    reward: 300,
    category: "progress",
    href: "/learn?mission=streaks",
    description: "Keep mining for 3 days and learn how streaks improve rewards.",
    cta: "View Progress",
  },
  {
    id: "level_3_task",
    title: "Progress: Reach Level 3",
    reward: 350,
    category: "progress",
    href: "/learn?mission=levels",
    description: "Learn how XP and levels unlock better KARPY progression.",
    cta: "View Progress",
  },
] as const;

export const PREMIUM_PERKS = [
  "x1.25 mining multiplier",
  "Improved daily chest rewards",
  "Premium badge on profile",
  "Extra progression speed",
  "Early access to future premium missions",
] as const;

export const FOUNDER_PACKS = [
  {
    id: "starter",
    title: "Starter Pack",
    cost: 2500,
    rewardBalance: 500,
    premiumDays: 3,
    boostHours: 12,
    boostMultiplier: 2,
  },
  {
    id: "dragon",
    title: "Dragon Pack",
    cost: 7500,
    rewardBalance: 2000,
    premiumDays: 7,
    boostHours: 24,
    boostMultiplier: 2,
  },
  {
    id: "founder",
    title: "Founder Pack",
    cost: 15000,
    rewardBalance: 5000,
    premiumDays: 30,
    boostHours: 48,
    boostMultiplier: 2,
  },
] as const;

export const ACHIEVEMENTS = [
  { id: "first_claim", title: "First Mine", reward: 250 },
  { id: "streak_3", title: "3 Day Streak", reward: 500 },
  { id: "streak_7", title: "7 Day Streak", reward: 1000 },
  { id: "referral_1", title: "First Active Referral", reward: 800 },
  { id: "mined_1000", title: "Mine 1,000 KARPY Points", reward: 1200 },
  { id: "level_5", title: "Reach Level 5", reward: 1500 },
  { id: "premium_user", title: "Become Premium", reward: 2000 },
] as const;

export function getMiningLevelFromXp(xp: number) {
  if (xp <= 0) return 1;
  return Math.floor(xp / 150) + 1;
}

export function getLevelMultiplier(level: number) {
  return Number(Math.min(2.5, 1 + Math.max(0, level - 1) * 0.04).toFixed(2));
}

export function getStreakBonus(streak: number) {
  if (streak >= 30) return 120;
  if (streak >= 14) return 80;
  if (streak >= 7) return 50;
  if (streak >= 3) return 25;
  return Math.min(streak * 5, 20);
}

export function getHolderBonus(balance: number) {
  if (balance >= 50000) return 120;
  if (balance >= 20000) return 80;
  if (balance >= 10000) return 50;
  if (balance >= 5000) return 25;
  return 0;
}

export function isPremiumActive(user: KarpyUserShape) {
  if (!user.isPremium || !user.premiumExpiresAt) return false;
  return new Date(user.premiumExpiresAt).getTime() > Date.now();
}

export function getActiveBoostMultiplier(user: KarpyUserShape) {
  const expiresAt = user.boostExpiresAt ? new Date(user.boostExpiresAt).getTime() : 0;
  if (!user.boostMultiplier || expiresAt <= Date.now()) return 1;
  return Math.max(1, Math.min(user.boostMultiplier, 3));
}

export function calculateBaseReward() {
  return BASE_DAILY_REWARD;
}

export function calculateDailyMiningReward(user: KarpyUserShape) {
  const baseReward = calculateBaseReward();
  const streakBonus = getStreakBonus(user.streak);
  const holderBonus = getHolderBonus(user.balance);
  const levelMultiplier = getLevelMultiplier(user.miningLevel);
  const premiumFactor = isPremiumActive(user) ? 1.25 : 1;
  const boostFactor = getActiveBoostMultiplier(user);

  const totalReward = Math.max(
    0,
    Math.floor((baseReward + streakBonus + holderBonus) * levelMultiplier * premiumFactor * boostFactor)
  );

  return {
    baseReward,
    streakBonus,
    holderBonus,
    levelMultiplier,
    premiumFactor,
    boostFactor,
    totalReward,
  };
}

export function getMiningProgress(xp: number) {
  const currentLevel = getMiningLevelFromXp(xp);
  const currentLevelBaseXp = (currentLevel - 1) * 150;
  const nextLevelXp = currentLevel * 150;
  const xpIntoLevel = xp - currentLevelBaseXp;
  const xpNeeded = nextLevelXp - xp;

  return {
    currentLevel,
    currentXp: xp,
    nextLevel: currentLevel + 1,
    xpIntoLevel,
    xpNeededForNext: Math.max(0, xpNeeded),
    progressPercent: Math.max(0, Math.min(100, Math.floor((xpIntoLevel / 150) * 100))),
    multiplier: getLevelMultiplier(currentLevel),
  };
}

export function makeReferralCode(wallet: string) {
  const tail = wallet.replace(/[^a-z0-9]/gi, "").slice(-6).toUpperCase() || "KARPY";
  return `KARPY-${tail}`;
}

export function getDailyChestReward(user: KarpyUserShape) {
  const premiumBonus = isPremiumActive(user) ? 40 : 0;
  const boost = getActiveBoostMultiplier(user) > 1 ? 25 : 0;
  const streak = user.streak >= 7 ? 30 : user.streak >= 3 ? 15 : 0;
  const base = 70 + premiumBonus + boost + streak + Math.min(user.miningLevel * 7, 120);
  return Math.floor(base);
}

export function getDailyChestTier(user: KarpyUserShape) {
  const score = user.miningLevel * 2 + Math.min(user.streak, 30) + (isPremiumActive(user) ? 20 : 0);
  if (score >= 80) return "Legendary";
  if (score >= 50) return "Epic";
  if (score >= 25) return "Rare";
  return "Common";
}

export function checkTaskUnlocked(user: KarpyUserShape, taskId: string) {
  switch (taskId) {
    case "streak_3_task":
      return user.streak >= 3;
    case "level_3_task":
      return user.miningLevel >= 3;
    default:
      return true;
  }
}

export function checkAchievementUnlocked(user: KarpyUserShape, achievementId: string) {
  switch (achievementId) {
    case "first_claim":
      return user.totalMined > 0;
    case "streak_3":
      return user.streak >= 3;
    case "streak_7":
      return user.streak >= 7;
    case "referral_1":
      return user.referrals >= 1;
    case "mined_1000":
      return user.totalMined >= 1000;
    case "level_5":
      return user.miningLevel >= 5;
    case "premium_user":
      return isPremiumActive(user);
    default:
      return false;
  }
}
