import { NextResponse } from "next/server";

import type { CalculationQuestion } from "@/features/training/types";
import { generateQuestionFromPattern } from "@/features/training/question-generator";
import { selectPlayableLevel } from "@/features/training/level-selection";
import { Domain } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/session";

const DEFAULT_QUESTIONS_PER_BATCH = 10;
const MIN_QUESTIONS_PER_BATCH = 1;
const MAX_QUESTIONS_PER_BATCH = 50;

const operationToDomain: Record<string, Domain> = {
  addition: Domain.ADD,
  subtraction: Domain.SUB,
  multiplication: Domain.MUL,
  division: Domain.DIV,
};

const defaultDomains: Domain[] = [Domain.ADD, Domain.SUB, Domain.MUL, Domain.DIV];

function randomSeed() {
  return Math.floor(Math.random() * 2_147_483_647);
}

function parseQuestionsCount(rawValue: string | null) {
  if (!rawValue) {
    return DEFAULT_QUESTIONS_PER_BATCH;
  }

  const parsed = Number.parseInt(rawValue, 10);
  if (!Number.isFinite(parsed)) {
    return DEFAULT_QUESTIONS_PER_BATCH;
  }

  return Math.min(MAX_QUESTIONS_PER_BATCH, Math.max(MIN_QUESTIONS_PER_BATCH, parsed));
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const selectedDomains = Array.from(
      new Set(
        searchParams
          .getAll("operations")
          .map((operation) => operationToDomain[operation])
          .filter((domain): domain is Domain => typeof domain !== "undefined"),
      ),
    );
    const targetCount = parseQuestionsCount(searchParams.get("count"));

    const activeDomains = selectedDomains.length > 0 ? selectedDomains : defaultDomains;

    const activePatterns = await prisma.pattern.findMany({
      where: {
        active: true,
        domain: {
          in: activeDomains,
        },
      },
      orderBy: {
        description: "asc",
      },
    });

    if (activePatterns.length === 0) {
      return NextResponse.json({ calculations: [] as CalculationQuestion[] });
    }

    const domainProgressRows = await prisma.userDomainProgress.findMany({
      where: {
        userId: session.user.id,
        domain: {
          in: activeDomains,
        },
      },
      select: {
        domain: true,
        currentLevel: true,
      },
    });

    const currentLevelByDomain = new Map<Domain, number>();
    for (const row of domainProgressRows) {
      currentLevelByDomain.set(row.domain, row.currentLevel);
    }

    const patternsByDomain = new Map<Domain, typeof activePatterns>();
    for (const pattern of activePatterns) {
      const existing = patternsByDomain.get(pattern.domain);
      if (existing) {
        existing.push(pattern);
      } else {
        patternsByDomain.set(pattern.domain, [pattern]);
      }
    }

    const domainQueue = Array.from(patternsByDomain.keys());
    if (domainQueue.length === 0) {
      return NextResponse.json({ calculations: [] as CalculationQuestion[] });
    }

    const calculations: CalculationQuestion[] = [];
    let cursor = 0;
    let attempts = 0;
    const maxAttempts = targetCount * 8;

    while (calculations.length < targetCount && attempts < maxAttempts) {
      const domain = domainQueue[cursor % domainQueue.length];
      const domainPatterns = patternsByDomain.get(domain) ?? [];

      if (domainPatterns.length === 0) {
        cursor += 1;
        attempts += 1;
        continue;
      }

      const levels = domainPatterns.map((pattern) => pattern.level);
      const currentLevel = currentLevelByDomain.get(domain) ?? 1;
      const selectedLevel = selectPlayableLevel({
        currentLevel,
        availableLevels: levels,
      });
      const levelPatterns = domainPatterns.filter((pattern) => pattern.level === selectedLevel);
      const patternPool = levelPatterns.length > 0 ? levelPatterns : domainPatterns;
      const pattern = patternPool[Math.floor(Math.random() * patternPool.length)];

      cursor += 1;
      attempts += 1;

      const seed = randomSeed();
      try {
        const generated = generateQuestionFromPattern({
          domain: pattern.domain,
          params: pattern.params,
          seed,
        });

        calculations.push({
          patternId: pattern.id,
          seed,
          ...generated,
        });
      } catch {
        continue;
      }
    }

    return NextResponse.json({ calculations });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to load training calculations",
      },
      { status: 500 },
    );
  }
}