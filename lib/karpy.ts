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
  return 1 + (level - 1) * 0.05;
}

export function getStreakBonus(streak: number): number {
  if (streak >= 30) return 75;
  if (streak >= 14) return 40;
  if (streak >= 7) return 25;
  if (streak >= 3) return 10;
  return 0;
}

export function getHolderBonus(_wallet: string): number {
  return 0;
}

export function getEmissionFactor(circulating: number): number {
  const ratio = circulating / MAX_SUPPLY;

  if (ratio >= 0.9) return 0.08;
  if (ratio >= 0.75) return 0.2;
  if (ratio >= 0.5) return 0.4;
  if (ratio >= 0.25) return 0.65;
  if (ratio >= 0.1) return 0.85;
  return 1;
}

export function calculateBaseReward(params: {
  level: number;
  streak: number;
  circulatingSupply: number;
}) {
  const base = 250;
  const streakBonus = getStreakBonus(params.streak);
  const levelMultiplier = getLevelMultiplier(params.level);
  const emission = getEmissionFactor(params.circulatingSupply);

  return Math.floor((base + streakBonus) * levelMultiplier * emission);
}

export function applyMultipliers(params: {
  baseReward: number;
  isPremium: boolean;
  premiumExpiresAt?: Date | null;
  boostMultiplier: number;
  boostExpiresAt?: Date | null;
}) {
  const now = new Date();

  let multiplier = 1;

  if (
    params.isPremium &&
    params.premiumExpiresAt &&
    params.premiumExpiresAt > now
  ) {
    multiplier += 0.5;
  }

  if (
    params.boostExpiresAt &&
    params.boostExpiresAt > now
  ) {
    multiplier *= params.boostMultiplier || 1;
  }

  return Math.floor(params.baseReward * multiplier);
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
  const referralBonus = Math.min(referrals * 5, 50);
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