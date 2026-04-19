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

export const BASE_DAILY_REWARD = 100;
export const XP_PER_CLAIM = 10;
export const XP_PER_TASK = 25;
export const REFERRAL_REWARD_NEW_USER = 250;
export const REFERRAL_REWARD_OWNER = 500;

export const PREMIUM_COST_KPY = 5000;
export const BOOST_X2_COST_KPY = 1000;

export const TASKS = [
  { id: "telegram", title: "Join official KARPY Telegram", reward: 500 },
  { id: "twitter", title: "Follow KARPY on X", reward: 500 },
  { id: "website", title: "Visit KARPY website", reward: 800 },
  { id: "holder", title: "Hold KARPY in your wallet", reward: 1200 },
  { id: "invite1", title: "Invite 1 KARPY miner", reward: 1500 },
] as const;

export function getMiningLevelFromXp(xp: number) {
  if (xp <= 0) return 1;
  return Math.floor(xp / 100) + 1;
}

export function getLevelMultiplier(level: number) {
  return Number((1 + Math.max(0, level - 1) * 0.05).toFixed(2));
}

export function getStreakBonus(streak: number) {
  return Math.min(streak * 15, 150);
}

export function getHolderBonus(balance: number) {
  if (balance >= 10000) return 150;
  if (balance >= 5000) return 75;
  if (balance >= 1000) return 25;
  return 0;
}

export function isPremiumActive(user: KarpyUserShape) {
  if (!user.isPremium || !user.premiumExpiresAt) return false;
  return new Date(user.premiumExpiresAt).getTime() > Date.now();
}

export function getActiveBoostMultiplier(user: KarpyUserShape) {
  const expiresAt = user.boostExpiresAt ? new Date(user.boostExpiresAt).getTime() : 0;
  if (!user.boostMultiplier || expiresAt <= Date.now()) return 1;
  return Math.max(1, user.boostMultiplier);
}

export function calculateBaseReward() {
  return BASE_DAILY_REWARD;
}

export function calculateDailyMiningReward(user: KarpyUserShape) {
  const baseReward = calculateBaseReward();
  const streakBonus = getStreakBonus(user.streak);
  const holderBonus = getHolderBonus(user.balance);
  const levelMultiplier = getLevelMultiplier(user.miningLevel);
  const premiumFactor = isPremiumActive(user) ? 1.5 : 1;
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
  const currentLevelBaseXp = (currentLevel - 1) * 100;
  const nextLevelXp = currentLevel * 100;
  const xpIntoLevel = xp - currentLevelBaseXp;
  const xpNeeded = nextLevelXp - xp;

  return {
    currentLevel,
    currentXp: xp,
    nextLevel: currentLevel + 1,
    xpIntoLevel,
    xpNeededForNext: Math.max(0, xpNeeded),
    progressPercent: Math.max(0, Math.min(100, Math.floor((xpIntoLevel / 100) * 100))),
    multiplier: getLevelMultiplier(currentLevel),
  };
}

export function makeReferralCode(wallet: string) {
  const tail = wallet.replace(/[^a-z0-9]/gi, "").slice(-6).toUpperCase() || "KARPY";
  return `KARPY-${tail}`;
}