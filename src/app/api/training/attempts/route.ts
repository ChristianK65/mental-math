import { NextResponse } from "next/server";
import Decimal from "decimal.js";
import { and, desc, eq } from "drizzle-orm";

import { generateQuestionFromPattern } from "@/features/training/question-generator";
import { evaluateLevelProgression } from "@/features/training/progression-rules";
import { db } from "@/db";
import {
  type AttemptOutcome,
  attempts,
  patterns,
  userDomainProgress,
} from "@/db/schema";
import { getServerSession } from "@/lib/session";

type CreateAttemptBody = {
  runId?: unknown;
  patternId?: unknown;
  seed?: unknown;
  firstSubmittedAnswer?: unknown;
  firstResponseMs?: unknown;
  skipped?: unknown;
};

function toNonEmptyString(value: unknown) {
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}

function toFiniteInteger(value: unknown) {
  if (typeof value !== "number" || !Number.isFinite(value) || !Number.isInteger(value)) {
    return null;
  }

  return value;
}

function toNonNegativeInteger(value: unknown) {
  const parsed = toFiniteInteger(value);
  if (parsed === null || parsed < 0) {
    return null;
  }

  return parsed;
}

function toBoolean(value: unknown) {
  return typeof value === "boolean" ? value : null;
}

function parseDecimalOrNull(value: string): Decimal | null {
  try {
    return new Decimal(value);
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as CreateAttemptBody;

    const runId = toNonEmptyString(body.runId);
    const patternId = toNonEmptyString(body.patternId);
    const seed = toFiniteInteger(body.seed);
    const firstResponseMs = toNonNegativeInteger(body.firstResponseMs);
    const skipped = toBoolean(body.skipped);

    if (!runId || !patternId || seed === null || firstResponseMs === null || skipped === null) {
      return NextResponse.json({ error: "Invalid attempt payload" }, { status: 400 });
    }

    const submittedAnswerRaw = body.firstSubmittedAnswer;
    if (skipped && submittedAnswerRaw !== null) {
      return NextResponse.json(
        { error: "Skipped attempts must not include firstSubmittedAnswer" },
        { status: 400 },
      );
    }

    if (!skipped && typeof submittedAnswerRaw !== "string") {
      return NextResponse.json(
        { error: "Non-skipped attempts must include firstSubmittedAnswer as a string" },
        { status: 400 },
      );
    }

    const [pattern] = await db
      .select({
        id: patterns.id,
        domain: patterns.domain,
        level: patterns.level,
        params: patterns.params,
        cutoffTimeMs: patterns.cutoffTimeMs,
      })
      .from(patterns)
      .where(eq(patterns.id, patternId))
      .limit(1);

    if (!pattern) {
      return NextResponse.json({ error: "Pattern not found" }, { status: 404 });
    }

    const generated = generateQuestionFromPattern({
      domain: pattern.domain,
      params: pattern.params,
      seed,
    });

    const expectedAnswer = new Decimal(generated.answer.toString());

    const firstSubmittedAnswer = skipped
      ? null
      : parseDecimalOrNull(submittedAnswerRaw as string);

    if (!skipped && firstSubmittedAnswer === null) {
      return NextResponse.json({ error: "Invalid firstSubmittedAnswer" }, { status: 400 });
    }

    let outcome: AttemptOutcome;

    if (skipped) {
      outcome = "SKIPPED";
    } else if (!firstSubmittedAnswer!.equals(expectedAnswer)) {
      outcome = "WRONG";
    } else if (firstResponseMs <= pattern.cutoffTimeMs) {
      outcome = "CORRECT";
    } else {
      outcome = "TIMEOUT";
    }

    await db.transaction(async (tx) => {
      const [progress] = await tx
        .insert(userDomainProgress)
        .values({
          userId: session.user.id,
          domain: pattern.domain,
          currentLevel: 1,
          highestUnlockedLevel: 1,
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: [userDomainProgress.userId, userDomainProgress.domain],
          set: { updatedAt: new Date() },
        })
        .returning({
          id: userDomainProgress.id,
          currentLevel: userDomainProgress.currentLevel,
          highestUnlockedLevel: userDomainProgress.highestUnlockedLevel,
        });

      await tx.insert(attempts).values({
        userId: session.user.id,
        patternId: pattern.id,
        runId,
        domain: pattern.domain,
        presentedLevel: pattern.level,
        seed,
        outcome,
        firstSubmittedAnswer: firstSubmittedAnswer !== null ? firstSubmittedAnswer.toString() : null,
        firstResponseMs,
        leftOperand: generated.left.toString(),
        rightOperand: generated.right === null ? null : generated.right.toString(),
        expectedAnswer: expectedAnswer.toString(),
      });

      if (pattern.level !== progress.currentLevel) {
        return;
      }

      const recentLevelAttempts = await tx
        .select({
          outcome: attempts.outcome,
        })
        .from(attempts)
        .where(
          and(
            eq(attempts.userId, session.user.id),
            eq(attempts.domain, pattern.domain),
            eq(attempts.presentedLevel, progress.currentLevel),
          ),
        )
        .orderBy(desc(attempts.createdAt))
        .limit(20);

      const progression = evaluateLevelProgression({
        currentLevel: progress.currentLevel,
        recentOutcomesDesc: recentLevelAttempts.map((attempt) => attempt.outcome),
      });

      if (progression.nextLevel === progress.currentLevel) {
        return;
      }

      await tx
        .update(userDomainProgress)
        .set({
          currentLevel: progression.nextLevel,
          highestUnlockedLevel: Math.max(progress.highestUnlockedLevel, progression.nextLevel),
          updatedAt: new Date(),
        })
        .where(eq(userDomainProgress.id, progress.id));
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to persist attempt",
      },
      { status: 500 },
    );
  }
}
