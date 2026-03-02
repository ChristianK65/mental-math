import type { AttemptOutcome } from "@/generated/prisma";

type EvaluateLevelProgressionInput = {
  currentLevel: number;
  recentOutcomesDesc: AttemptOutcome[];
};

export const PROMOTION_WINDOW = 10;
export const DEMOTION_WINDOW = 20;
export const DEMOTION_UNSOLVED_RATE_MAX = 0.25;

function isSolved(outcome: AttemptOutcome) {
  return outcome === "CORRECT";
}

function normalizeLevel(level: number) {
  if (!Number.isFinite(level)) {
    return 1;
  }

  return Math.max(1, Math.floor(level));
}

export function evaluateLevelProgression({
  currentLevel,
  recentOutcomesDesc,
}: EvaluateLevelProgressionInput) {
  const normalizedCurrentLevel = normalizeLevel(currentLevel);

  const promotionSlice = recentOutcomesDesc.slice(0, PROMOTION_WINDOW);
  const canPromote =
    promotionSlice.length === PROMOTION_WINDOW && promotionSlice.every((outcome) => isSolved(outcome));

  if (canPromote) {
    return {
      nextLevel: normalizedCurrentLevel + 1,
      reason: "PROMOTION" as const,
    };
  }

  const demotionSlice = recentOutcomesDesc.slice(0, DEMOTION_WINDOW);
  const hasDemotionExposure = demotionSlice.length === DEMOTION_WINDOW;

  if (!hasDemotionExposure || normalizedCurrentLevel <= 1) {
    return {
      nextLevel: normalizedCurrentLevel,
      reason: "NO_CHANGE" as const,
    };
  }

  const unsolvedCount = demotionSlice.reduce((total, outcome) => {
    if (isSolved(outcome)) {
      return total;
    }

    return total + 1;
  }, 0);
  const unsolvedRate = unsolvedCount / DEMOTION_WINDOW;

  if (unsolvedRate > DEMOTION_UNSOLVED_RATE_MAX) {
    return {
      nextLevel: Math.max(1, normalizedCurrentLevel - 1),
      reason: "DEMOTION" as const,
    };
  }

  return {
    nextLevel: normalizedCurrentLevel,
    reason: "NO_CHANGE" as const,
  };
}