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

export const BASE_DAILY_REWARD = 70;
export const XP_PER_CLAIM = 15;
export const XP_PER_TASK = 25;
export const REFERRAL_REWARD_NEW_USER = 75;
export const REFERRAL_REWARD_OWNER = 200;

export const PREMIUM_COST_KPY = 5000;
export const BOOST_X2_COST_KPY = 1000;

export const TASKS = [
  {
    id: "learn_blockchain",
    title: "Learn: What is blockchain?",
    reward: 120,
    category: "Learn & Earn",
    description: "Read a short crypto lesson and answer a quick question.",
    href: "/learn?mission=blockchain",
    cta: "Start lesson",
  },
  {
    id: "learn_wallet",
    title: "Learn: Wallet safety basics",
    reward: 140,
    category: "Learn & Earn",
    description: "Understand seed phrases, wallets and safe storage.",
    href: "/learn?mission=wallet",
    cta: "Start lesson",
  },
  {
    id: "quiz_daily_crypto",
    title: "Daily crypto quiz",
    reward: 160,
    category: "Quiz",
    description: "Answer 3 crypto questions to earn KARPY Points.",
    href: "/quiz?mission=daily",
    cta: "Take quiz",
  },
  {
    id: "quiz_risk",
    title: "Risk awareness test",
    reward: 180,
    category: "Quiz",
    description: "Learn how to avoid hype, scams and unsafe promises.",
    href: "/quiz?mission=risk",
    cta: "Take test",
  },
  {
    id: "game_tap_reactor",
    title: "Tap Reactor mini game",
    reward: 130,
    category: "Mini Game",
    description: "Tap the reactor to charge your daily activity meter.",
    href: "/games?mission=tap",
    cta: "Play game",
  },
  {
    id: "game_memory",
    title: "Crypto memory match",
    reward: 220,
    category: "Mini Game",
    description: "Match crypto concepts and complete the memory challenge.",
    href: "/games?mission=memory",
    cta: "Play game",
  },
  {
    id: "team_invite_code",
    title: "Open Team Hub",
    reward: 90,
    category: "Team",
    description: "View your referral code and learn how team rewards work.",
    href: "/team",
    cta: "Open team",
  },
  {
    id: "streak_3_mission",
    title: "Build a 3 day streak",
    reward: 300,
    category: "Progress",
    description: "Claim mining rewards for 3 days and unlock this mission.",
    href: "/learn?mission=streak",
    cta: "View progress",
  },
  {
    id: "level_3_mission",
    title: "Reach Level 3",
    reward: 350,
    category: "Progress",
    description: "Level up through mining, quiz and game activity.",
    href: "/learn?mission=level",
    cta: "View progress",
  },
] as const;

export const PREMIUM_PERKS = [
  "x1.25 mining multiplier",
  "Better daily chest rewards",
  "Premium badge on profile",
  "Faster progression",
  "Priority future features",
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
  { id: "first_claim", title: "First Claim", reward: 300 },
  { id: "streak_3", title: "3 Day Streak", reward: 500 },
  { id: "streak_7", title: "7 Day Streak", reward: 1000 },
  { id: "referral_1", title: "First Referral", reward: 800 },
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
  if (streak >= 30) return 140;
  if (streak >= 14) return 95;
  if (streak >= 7) return 60;
  if (streak >= 3) return 30;
  return Math.min(streak * 8, 24);
}

export function getHolderBonus(balance: number) {
  if (balance >= 50000) return 140;
  if (balance >= 20000) return 95;
  if (balance >= 10000) return 60;
  if (balance >= 5000) return 30;
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

export function getDailyChestTier(user: KarpyUserShape) {
  const score =
    user.miningLevel * 2 +
    Math.min(user.streak, 30) +
    (isPremiumActive(user) ? 18 : 0) +
    (getActiveBoostMultiplier(user) > 1 ? 10 : 0);

  if (score >= 80) return "legendary";
  if (score >= 50) return "epic";
  if (score >= 25) return "rare";
  return "common";
}

export function getDailyChestReward(user: KarpyUserShape) {
  const tier = getDailyChestTier(user);
  const levelBonus = Math.min(user.miningLevel * 6, 90);

  if (tier === "legendary") return 450 + levelBonus;
  if (tier === "epic") return 250 + levelBonus;
  if (tier === "rare") return 140 + levelBonus;
  return 70 + levelBonus;
}

export function checkTaskUnlocked(user: KarpyUserShape, taskId: string) {
  switch (taskId) {
    case "streak_3_mission":
      return user.streak >= 3;
    case "level_3_mission":
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
      return !!user.isPremium;
    default:
      return false;
  }
}
