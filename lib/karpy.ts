export const MAX_SUPPLY = 1_000_000_000;

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
}) {
  const baseReward = 250;

  const levelMultiplier = getLevelMultiplier(params.level);
  const streakBonus = getStreakBonus(params.streak);
  const referralBonus = getReferralBonus(params.referrals);
  const emission = getEmissionFactor(params.circulatingSupply);

  const reward = Math.floor(
    (baseReward + streakBonus + referralBonus) *
      levelMultiplier *
      emission
  );

  return reward;
}