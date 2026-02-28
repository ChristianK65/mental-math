import { NextResponse } from "next/server";

import type { CalculationQuestion } from "@/features/training/types";
import { generateQuestionFromPattern } from "@/features/training/question-generator";
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

    const levelOnePatterns = await prisma.pattern.findMany({
      where: {
        active: true,
        domain: {
          in: activeDomains,
        },
        level: 1,
      },
      orderBy: {
        description: "asc",
      },
    });

    if (levelOnePatterns.length === 0) {
      return NextResponse.json({ calculations: [] as CalculationQuestion[] });
    }

    const calculations: CalculationQuestion[] = [];
    let cursor = 0;
    let attempts = 0;
    const maxAttempts = targetCount * 8;

    while (calculations.length < targetCount && attempts < maxAttempts) {
      const pattern = levelOnePatterns[cursor % levelOnePatterns.length];
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