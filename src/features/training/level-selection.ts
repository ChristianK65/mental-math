type LevelWeight = {
  level: number;
  weight: number;
};

type SelectPlayableLevelInput = {
  currentLevel: number;
  availableLevels: number[];
  random?: () => number;
  lowerLevelDecay?: number;
};

const CURRENT_LEVEL_WEIGHT = 0.5;
const NEXT_LEVEL_WEIGHT = 0.1;
const LOWER_LEVELS_WEIGHT = 0.4;
const LEVEL_ONE_CURRENT_WEIGHT = 0.9;
const DEFAULT_LOWER_LEVEL_DECAY = 0.6;

function normalizeLevel(value: number) {
  if (!Number.isFinite(value)) {
    return 1;
  }

  return Math.max(1, Math.floor(value));
}

function normalizeDecay(value: number) {
  if (!Number.isFinite(value) || value <= 0 || value >= 1) {
    return DEFAULT_LOWER_LEVEL_DECAY;
  }

  return value;
}

function buildRequestedLevelWeights(currentLevel: number, lowerLevelDecay: number): LevelWeight[] {
  const normalizedCurrentLevel = normalizeLevel(currentLevel);

  if (normalizedCurrentLevel === 1) {
    return [
      { level: 1, weight: LEVEL_ONE_CURRENT_WEIGHT },
      { level: 2, weight: NEXT_LEVEL_WEIGHT },
    ];
  }

  const weights: LevelWeight[] = [];
  const lowerLevels = normalizedCurrentLevel - 1;

  let lowerWeightTotal = 0;
  const lowerWeights: LevelWeight[] = [];
  for (let level = 1; level <= lowerLevels; level += 1) {
    const geometricWeight = lowerLevelDecay ** (lowerLevels - level);
    lowerWeights.push({ level, weight: geometricWeight });
    lowerWeightTotal += geometricWeight;
  }

  if (lowerWeightTotal > 0) {
    for (const lowerWeight of lowerWeights) {
      weights.push({
        level: lowerWeight.level,
        weight: (lowerWeight.weight / lowerWeightTotal) * LOWER_LEVELS_WEIGHT,
      });
    }
  }

  weights.push({ level: normalizedCurrentLevel, weight: CURRENT_LEVEL_WEIGHT });
  weights.push({ level: normalizedCurrentLevel + 1, weight: NEXT_LEVEL_WEIGHT });

  return weights;
}

function sampleWeightedLevel(weights: LevelWeight[], random: () => number) {
  const totalWeight = weights.reduce((total, entry) => total + entry.weight, 0);
  if (totalWeight <= 0) {
    return null;
  }

  const target = random() * totalWeight;
  let cumulative = 0;

  for (const entry of weights) {
    cumulative += entry.weight;
    if (target <= cumulative) {
      return entry.level;
    }
  }

  return weights[weights.length - 1]?.level ?? null;
}

function fallbackLevel(availableLevels: number[], currentLevel: number) {
  const normalizedCurrentLevel = normalizeLevel(currentLevel);
  const sortedLevels = Array.from(new Set(availableLevels)).sort((a, b) => a - b);
  if (sortedLevels.length === 0) {
    return null;
  }

  const notAboveCurrent = sortedLevels.filter((level) => level <= normalizedCurrentLevel);
  if (notAboveCurrent.length > 0) {
    return notAboveCurrent[notAboveCurrent.length - 1];
  }

  return sortedLevels[0] ?? null;
}

export function selectPlayableLevel({
  currentLevel,
  availableLevels,
  random = Math.random,
  lowerLevelDecay = DEFAULT_LOWER_LEVEL_DECAY,
}: SelectPlayableLevelInput) {
  const uniqueAvailableLevels = Array.from(new Set(availableLevels));
  if (uniqueAvailableLevels.length === 0) {
    throw new Error("Cannot select level from empty availableLevels");
  }

  const requestedWeights = buildRequestedLevelWeights(
    normalizeLevel(currentLevel),
    normalizeDecay(lowerLevelDecay),
  );
  const playableWeights = requestedWeights.filter((entry) =>
    uniqueAvailableLevels.includes(entry.level)
  );

  if (playableWeights.length === 0) {
    const fallback = fallbackLevel(uniqueAvailableLevels, currentLevel);
    if (fallback === null) {
      throw new Error("Cannot select fallback level");
    }

    return fallback;
  }

  const sampled = sampleWeightedLevel(playableWeights, random);
  if (sampled !== null) {
    return sampled;
  }

  const fallback = fallbackLevel(uniqueAvailableLevels, currentLevel);
  if (fallback === null) {
    throw new Error("Cannot select level");
  }

  return fallback;
}