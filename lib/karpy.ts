export const MAX_SUPPLY = 1_000_000_000;

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