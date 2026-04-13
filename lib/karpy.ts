export const MAX_SUPPLY = 1_000_000_000;

export const XP_PER_CLAIM = 10;
export const XP_PER_TASK = 25;

export type TaskDefinition = {
  id: string;
  title: string;
  reward: number;
};

export const TASKS: TaskDefinition[] = [
  {
    id: "telegram",
    title: "Join official KARPY Telegram",
    reward: 500,
  },
  {
    id: "twitter",
    title: "Follow KARPY on X",
    reward: 500,
  },
  {
    id: "website",
    title: "Visit KARPY website",
    reward: 800,
  },
  {
    id: "holder",
    title: "Hold KARPY in your wallet",
    reward: 1200,
  },
  {
    id: "invite1",
    title: "Invite 1 KARPY miner",
    reward: 1500,
  },
];

export function makeReferralCode(wallet: string): string {
  const clean = wallet.toLowerCase().replace(/[^a-z0-9]/g, "");
  return `KARPY-${clean.slice(0, 8)}`;
}

export function getMiningLevelFromXp(xp: number): number {
  return Math.max(1, Math.floor(xp / 100) + 1);
}

export function getLevelMultiplier(level: number): number {
  const multipliers: Record<number, number> = {
    1: 1.0,
    2: 1.05,
    3: 1.12,
    4: 1.2,
    5: 1.3,
    6: 1.42,
    7: 1.55,
  };

  return multipliers[level] || 1.6;
}

export function getStreakBonus(streak: number): number {
  if (streak >= 30) return 75;
  if (streak >= 14) return 40;
  if (streak >= 7) return 25;
  if (streak >= 3) return 10;
  return 0;
}

export function getHolderBonus(wallet: string): number {
  if (!wallet) return 0;
  return 0;
}

export function getReferralBonus(referrals: number): number {
  return Math.min(referrals * 5, 50);
}

export function getEmissionFactor(circulating: number): number {
  const ratio = circulating / MAX_SUPPLY;

  if (ratio >= 0.9) return 0.08;
  if (ratio >= 0.75) return 0.2;
  if (ratio >= 0.5) return 0.4;
  if (ratio >= 0.25) return 0.65;
  if (ratio >= 0.1) return 0.85;
  return 1.0;
}

export function calculateMiningReward(params: {
  level: number;
  streak: number;
  referrals: number;
  circulatingSupply: number;
  wallet?: string;
}) {
  const baseReward = 250;
  const streakBonus = getStreakBonus(params.streak);
  const holderBonus = getHolderBonus(params.wallet || "");
  const referralBonus = getReferralBonus(params.referrals);
  const levelMultiplier = getLevelMultiplier(params.level);
  const emissionFactor = getEmissionFactor(params.circulatingSupply);

  const reward = Math.floor(
    (baseReward + streakBonus + holderBonus + referralBonus) *
      levelMultiplier *
      emissionFactor
  );

  return Math.max(0, reward);
}

export async function getDailyMiningReward(
  streak: number,
  wallet: string,
  previewXp: number,
  referrals = 0,
  circulatingSupply = 0
) {
  const level = getMiningLevelFromXp(previewXp);
  const baseReward = 250;
  const streakBonus = getStreakBonus(streak);
  const holderBonus = getHolderBonus(wallet);
  const referralBonus = getReferralBonus(referrals);
  const levelMultiplier = getLevelMultiplier(level);
  const emissionFactor = getEmissionFactor(circulatingSupply);

  const totalReward = Math.floor(
    (baseReward + streakBonus + holderBonus + referralBonus) *
      levelMultiplier *
      emissionFactor
  );

  return {
    baseReward,
    streakBonus,
    holderBonus,
    referralBonus,
    levelMultiplier,
    emissionFactor,
    totalReward: Math.max(0, totalReward),
  };
}

export function getMiningProgress(xp: number) {
  const currentLevel = getMiningLevelFromXp(xp);
  const currentLevelBaseXp = (currentLevel - 1) * 100;
  const nextLevelXp = currentLevel * 100;
  const xpInLevel = xp - currentLevelBaseXp;
  const xpNeeded = nextLevelXp - xp;
  const progressPercent = Math.max(
    0,
    Math.min(100, Math.floor((xpInLevel / 100) * 100))
  );

  return {
    currentLevel,
    currentXp: xp,
    nextLevel: currentLevel + 1,
    xpInLevel,
    xpNeeded,
    progressPercent,
    multiplier: getLevelMultiplier(currentLevel),
  };
}