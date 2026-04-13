import { db } from "@/lib/db";

export const DAILY_SECONDS = 24 * 60 * 60;
export const BASE_REWARD = 1000;
export const MIN_REWARD = 25;
export const XP_PER_CLAIM = 10;
export const XP_PER_TASK = 5;

export const TASKS = [
  { id: "telegram", title: "Join official KARPY Telegram", reward: 500 },
  { id: "twitter", title: "Follow KARPY on X", reward: 500 },
  { id: "website", title: "Visit KARPY website", reward: 800 },
  { id: "holder", title: "Hold KARPY in your wallet", reward: 1200 },
  { id: "invite1", title: "Invite 1 KARPY miner", reward: 1500 },
];

export type MiningLevelInfo = {
  level: number;
  xpRequired: number;
  multiplier: number;
};

export const MINING_LEVELS: MiningLevelInfo[] = [
  { level: 1, xpRequired: 0, multiplier: 1.0 },
  { level: 2, xpRequired: 100, multiplier: 1.08 },
  { level: 3, xpRequired: 250, multiplier: 1.16 },
  { level: 4, xpRequired: 500, multiplier: 1.26 },
  { level: 5, xpRequired: 900, multiplier: 1.38 },
  { level: 6, xpRequired: 1400, multiplier: 1.52 },
  { level: 7, xpRequired: 2100, multiplier: 1.68 },
];

export function getStreakBonus(streak: number): number {
  if (streak >= 30) return 300;
  if (streak >= 14) return 200;
  if (streak >= 7) return 120;
  if (streak >= 3) return 60;
  return 0;
}

export function canClaim(lastClaimAt: Date | null): boolean {
  if (!lastClaimAt) return true;
  const diff = Date.now() - new Date(lastClaimAt).getTime();
  return diff >= DAILY_SECONDS * 1000;
}

export function secondsRemaining(lastClaimAt: Date | null): number {
  if (!lastClaimAt) return 0;
  const elapsed = Math.floor((Date.now() - new Date(lastClaimAt).getTime()) / 1000);
  return Math.max(0, DAILY_SECONDS - elapsed);
}

export function makeReferralCode(wallet: string): string {
  return `KARPY-${wallet.slice(0, 4).toUpperCase()}${wallet.slice(-4).toUpperCase()}`;
}

export async function getHolderBonus(_wallet: string): Promise<number> {
  return 0;
}

export async function getTotalUsers(): Promise<number> {
  return db.user.count();
}

export async function getDynamicBaseReward(): Promise<number> {
  const totalUsers = await getTotalUsers();
  const growthFactor = 1 + Math.log10(Math.max(totalUsers, 1));
  const reward = Math.floor(BASE_REWARD / growthFactor);
  return Math.max(MIN_REWARD, reward);
}

export function getMiningLevelFromXp(xp: number): MiningLevelInfo {
  let current = MINING_LEVELS[0];
  for (const level of MINING_LEVELS) {
    if (xp >= level.xpRequired) current = level;
  }
  return current;
}

export function getNextMiningLevel(xp: number): MiningLevelInfo | null {
  const current = getMiningLevelFromXp(xp);
  return MINING_LEVELS.find((lvl) => lvl.level === current.level + 1) ?? null;
}

export function getMiningProgress(xp: number) {
  const current = getMiningLevelFromXp(xp);
  const next = getNextMiningLevel(xp);

  if (!next) {
    return {
      currentLevel: current.level,
      currentXp: xp,
      nextLevel: null,
      xpIntoLevel: 0,
      xpNeededForNext: 0,
      progressPercent: 100,
      multiplier: current.multiplier,
    };
  }

  const xpIntoLevel = xp - current.xpRequired;
  const xpNeededForNext = next.xpRequired - current.xpRequired;
  const progressPercent = Math.max(
    0,
    Math.min(100, Math.floor((xpIntoLevel / xpNeededForNext) * 100))
  );

  return {
    currentLevel: current.level,
    currentXp: xp,
    nextLevel: next.level,
    xpIntoLevel,
    xpNeededForNext,
    progressPercent,
    multiplier: current.multiplier,
  };
}

export async function getDailyMiningReward(
  streak: number,
  wallet: string,
  miningXp: number
) {
  const baseReward = await getDynamicBaseReward();
  const streakBonus = getStreakBonus(streak);
  const holderBonus = await getHolderBonus(wallet);

  const levelInfo = getMiningLevelFromXp(miningXp);
  const subtotal = baseReward + streakBonus + holderBonus;
  const totalReward = Math.floor(subtotal * levelInfo.multiplier);

  return {
    baseReward,
    streakBonus,
    holderBonus,
    levelMultiplier: levelInfo.multiplier,
    totalReward,
  };
}