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

export const BASE_DAILY_REWARD = 60;
export const XP_PER_CLAIM = 15;
export const XP_PER_TASK = 20;

export const REFERRAL_REWARD_NEW_USER = 50;
export const REFERRAL_REWARD_OWNER = 150;

export const PREMIUM_COST_KPY = 5000;
export const BOOST_X2_COST_KPY = 1200;

export const TASKS = [
  // Daily / low abuse
  { id: "daily_open", title: "Open KARPY today", reward: 25, category: "daily" },
  { id: "daily_claim", title: "Claim today’s mining reward", reward: 40, category: "daily" },
  { id: "daily_chest", title: "Open daily chest", reward: 35, category: "daily" },
  { id: "leaderboard", title: "Check leaderboard", reward: 20, category: "daily" },

  // Social / small rewards only
  { id: "telegram", title: "Join official KARPY Telegram", reward: 100, category: "social" },
  { id: "twitter", title: "Follow KARPY on X", reward: 100, category: "social" },
  { id: "website", title: "Visit KARPY website", reward: 75, category: "social" },

  // Progression
  { id: "streak3", title: "Reach 3 day streak", reward: 150, category: "progress" },
  { id: "streak7", title: "Reach 7 day streak", reward: 350, category: "progress" },
  { id: "level3", title: "Reach Level 3", reward: 250, category: "progress" },
  { id: "level5", title: "Reach Level 5", reward: 600, category: "progress" },
  { id: "mined1000", title: "Mine 1,000 KPY total", reward: 400, category: "progress" },

  // Referral
  { id: "invite1", title: "Invite 1 active KARPY miner", reward: 300, category: "referral" },
  { id: "invite3", title: "Invite 3 active KARPY miners", reward: 800, category: "referral" },
  { id: "invite5", title: "Invite 5 active KARPY miners", reward: 1500, category: "referral" },
] as const;

export const PREMIUM_PERKS = [
  "x1.25 mining multiplier",
  "Better daily chest odds",
  "Premium profile badge",
  "Extra progression rewards",
  "Priority future features",
] as const;

export const STORE_ITEMS = [
  {
    id: "boost_x2_24h",
    title: "x2 Mining Boost",
    description: "Double mining rewards for 24 hours.",
    cost: BOOST_X2_COST_KPY,
    type: "boost",
  },
  {
    id: "premium_7d",
    title: "Premium 7 Days",
    description: "Mining bonus, better chest odds and premium badge.",
    cost: PREMIUM_COST_KPY,
    type: "premium",
  },
  {
    id: "streak_shield",
    title: "Streak Shield",
    description: "Protect your streak once in the future.",
    cost: 2500,
    type: "utility",
  },
  {
    id: "blue_aura",
    title: "Blue Aura Badge",
    description: "Cosmetic profile status item.",
    cost: 3500,
    type: "cosmetic",
  },
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
  { id: "first_claim", title: "First Claim", reward: 150 },
  { id: "streak_3", title: "3 Day Streak", reward: 250 },
  { id: "streak_7", title: "7 Day Streak", reward: 600 },
  { id: "streak_30", title: "30 Day Streak", reward: 2500 },
  { id: "referral_1", title: "First Active Referral", reward: 400 },
  { id: "referral_5", title: "5 Active Referrals", reward: 1500 },
  { id: "mined_1000", title: "Mine 1,000 KPY", reward: 500 },
  { id: "mined_10000", title: "Mine 10,000 KPY", reward: 2500 },
  { id: "level_5", title: "Reach Level 5", reward: 1000 },
  { id: "level_10", title: "Reach Level 10", reward: 3000 },
  { id: "premium_user", title: "Become Premium", reward: 750 },
] as const;

export function getMiningLevelFromXp(xp: number) {
  if (xp <= 0) return 1;
  return Math.floor(xp / 150) + 1;
}

export function getLevelMultiplier(level: number) {
  const safeLevel = Math.max(1, level);
  return Number(Math.min(2.5, 1 + (safeLevel - 1) * 0.04).toFixed(2));
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

export function getReferralLink(baseUrl: string, referralCode: string) {
  const cleanBase = baseUrl.replace(/\/$/, "");
  return `${cleanBase}/auth?ref=${encodeURIComponent(referralCode)}`;
}

export function getDailyChestReward(user: KarpyUserShape) {
  const premium = isPremiumActive(user);
  const boostActive = getActiveBoostMultiplier(user) > 1;

  const base = 60;
  const premiumBonus = premium ? 35 : 0;
  const boostBonus = boostActive ? 20 : 0;
  const levelBonus = Math.min(user.miningLevel * 6, 90);
  const streakBonus = user.streak >= 7 ? 30 : user.streak >= 3 ? 15 : 0;

  return Math.floor(base + premiumBonus + boostBonus + levelBonus + streakBonus);
}

export function getDailyChestTier(user: KarpyUserShape) {
  const score =
    user.miningLevel * 2 +
    Math.min(user.streak, 30) +
    (isPremiumActive(user) ? 20 : 0) +
    (getActiveBoostMultiplier(user) > 1 ? 10 : 0);

  if (score >= 80) return "legendary";
  if (score >= 50) return "epic";
  if (score >= 25) return "rare";
  return "common";
}

export function checkTaskUnlocked(user: KarpyUserShape, taskId: string) {
  switch (taskId) {
    case "streak3":
      return user.streak >= 3;
    case "streak7":
      return user.streak >= 7;
    case "level3":
      return user.miningLevel >= 3;
    case "level5":
      return user.miningLevel >= 5;
    case "mined1000":
      return user.totalMined >= 1000;
    case "invite1":
      return user.referrals >= 1;
    case "invite3":
      return user.referrals >= 3;
    case "invite5":
      return user.referrals >= 5;
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
    case "streak_30":
      return user.streak >= 30;
    case "referral_1":
      return user.referrals >= 1;
    case "referral_5":
      return user.referrals >= 5;
    case "mined_1000":
      return user.totalMined >= 1000;
    case "mined_10000":
      return user.totalMined >= 10000;
    case "level_5":
      return user.miningLevel >= 5;
    case "level_10":
      return user.miningLevel >= 10;
    case "premium_user":
      return isPremiumActive(user);
    default:
      return false;
  }
}