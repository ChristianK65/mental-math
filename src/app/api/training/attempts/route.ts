import { NextResponse } from "next/server";

import { Prisma } from "@/generated/prisma";
import { generateQuestionFromPattern } from "@/features/training/question-generator";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/session";

type CreateAttemptBody = {
  runId?: unknown;
  patternId?: unknown;
  seed?: unknown;
  firstSubmittedAnswer?: unknown;
  firstResponseMs?: unknown;
  skipped?: unknown;
};

type AttemptOutcomeValue = "CORRECT" | "WRONG" | "TIMEOUT" | "SKIPPED";

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

    const pattern = await prisma.pattern.findUnique({
      where: {
        id: patternId,
      },
      select: {
        id: true,
        domain: true,
        level: true,
        params: true,
        cutoffTimeMs: true,
      },
    });

    if (!pattern) {
      return NextResponse.json({ error: "Pattern not found" }, { status: 404 });
    }

    const generated = generateQuestionFromPattern({
      domain: pattern.domain,
      params: pattern.params,
      seed,
    });

    const expectedAnswer = new Prisma.Decimal(generated.answer.toString());

    const firstSubmittedAnswer = skipped
      ? null
      : (() => {
          try {
            return new Prisma.Decimal(submittedAnswerRaw as string);
          } catch {
            return null;
          }
        })();

    if (!skipped && firstSubmittedAnswer === null) {
      return NextResponse.json({ error: "Invalid firstSubmittedAnswer" }, { status: 400 });
    }

    let outcome: AttemptOutcomeValue;

    if (skipped) {
      outcome = "SKIPPED";
    } else if (!firstSubmittedAnswer!.equals(expectedAnswer)) {
      outcome = "WRONG";
    } else if (firstResponseMs <= pattern.cutoffTimeMs) {
      outcome = "CORRECT";
    } else {
      outcome = "TIMEOUT";
    }

    const attemptData: Prisma.AttemptUncheckedCreateInput = {
      userId: session.user.id,
      patternId: pattern.id,
      runId,
      domain: pattern.domain,
      presentedLevel: pattern.level,
      seed,
      outcome,
      firstSubmittedAnswer,
      firstResponseMs,
      leftOperand: new Prisma.Decimal(generated.left.toString()),
      rightOperand:
        generated.right === null ? null : new Prisma.Decimal(generated.right.toString()),
      expectedAnswer,
    };

    await prisma.attempt.create({
      data: attemptData,
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
