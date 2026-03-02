import Link from "next/link";
import { redirect } from "next/navigation";

import { Domain } from "@/generated/prisma";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

type SearchParams = Record<string, string | string[] | undefined>;

const operatorByDomain = {
  ADD: "+",
  SUB: "−",
  MUL: "×",
  DIV: "÷",
} as const;

const orderedDomains: Domain[] = [Domain.ADD, Domain.SUB, Domain.MUL, Domain.DIV];

const domainLabel: Record<Domain, string> = {
  ADD: "Addition",
  SUB: "Subtraction",
  MUL: "Multiplication",
  DIV: "Division",
};

function readSingleParam(value: string | string[] | undefined) {
  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value) && value.length > 0) {
    return value[0];
  }

  return null;
}

function formatDecimal(value: { toString: () => string } | null) {
  if (value === null) {
    return "—";
  }

  const asString = value.toString();
  return asString.includes(".")
    ? asString.replace(/\.0+$/, "").replace(/(\.\d*?)0+$/, "$1")
    : asString;
}

export default async function TrainingOverviewPage({
  searchParams,
}: {
  searchParams?: SearchParams | Promise<SearchParams>;
}) {
  const session = await getServerSession();

  if (!session) {
    redirect("/");
  }

  const resolvedSearchParams = (await searchParams) ?? {};
  const requestedRunId = readSingleParam(resolvedSearchParams.runId);

  let runId = requestedRunId;
  if (!runId) {
    const latestAttempt = await prisma.attempt.findFirst({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        runId: true,
      },
    });

    runId = latestAttempt?.runId ?? null;
  }

  if (!runId) {
    return (
      <div className="min-h-screen bg-[#f8f6f2] text-[#1b1b1b]">
        <div className="mx-auto flex min-h-screen w-full max-w-4xl flex-col px-6 pb-16 pt-8 sm:px-10">
          <header className="flex items-center justify-between">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#1b1b1b] text-xs font-bold text-white">
              S
            </span>
            <Link className="rounded-full px-3 py-2 text-sm font-medium" href="/dashboard">
              Dashboard
            </Link>
          </header>

          <main className="mt-16 rounded-3xl border border-[#1b1b1b]/10 bg-white p-8">
            <h1 className="text-2xl font-semibold">Training overview</h1>
            <p className="mt-3 text-sm text-[#1b1b1b]/65">No attempts found yet.</p>
          </main>
        </div>
      </div>
    );
  }

  const attempts = await prisma.attempt.findMany({
    where: {
      userId: session.user.id,
      runId,
    },
    orderBy: {
      createdAt: "asc",
    },
    select: {
      id: true,
      domain: true,
      outcome: true,
      leftOperand: true,
      rightOperand: true,
      firstSubmittedAnswer: true,
      expectedAnswer: true,
      firstResponseMs: true,
    },
  });

  const summary = {
    correct: attempts.filter((attempt) => attempt.outcome === "CORRECT").length,
    wrong: attempts.filter((attempt) => attempt.outcome === "WRONG").length,
    timeout: attempts.filter((attempt) => attempt.outcome === "TIMEOUT").length,
    skipped: attempts.filter((attempt) => attempt.outcome === "SKIPPED").length,
  };

  const progressRows = await prisma.userDomainProgress.findMany({
    where: {
      userId: session.user.id,
      domain: {
        in: orderedDomains,
      },
    },
    select: {
      domain: true,
      currentLevel: true,
      highestUnlockedLevel: true,
    },
  });

  const progressByDomain = new Map(progressRows.map((row) => [row.domain, row]));
  const levels = orderedDomains.map((domain) => {
    const row = progressByDomain.get(domain);
    return {
      domain,
      currentLevel: row?.currentLevel ?? 1,
      highestUnlockedLevel: row?.highestUnlockedLevel ?? 1,
    };
  });

  return (
    <div className="min-h-screen bg-[#f8f6f2] text-[#1b1b1b]">
      <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-6 pb-16 pt-8 sm:px-10">
        <header className="flex items-center justify-between">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#1b1b1b] text-xs font-bold text-white">
            S
          </span>
          <div className="flex items-center gap-2 text-sm font-medium">
            <Link className="rounded-full px-3 py-2" href="/training">
              Train again
            </Link>
            <Link className="rounded-full px-3 py-2" href="/dashboard">
              Dashboard
            </Link>
          </div>
        </header>

        <main className="mt-10 rounded-3xl border border-[#1b1b1b]/10 bg-white p-8">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-[#1b1b1b]/60">Training overview</p>
              <h1 className="mt-2 text-2xl font-semibold">Run results</h1>
              <p className="mt-1 text-xs text-[#1b1b1b]/50">Run ID: {runId}</p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs font-semibold">
              <span className="rounded-full bg-green-100 px-3 py-1 text-green-800">Correct: {summary.correct}</span>
              <span className="rounded-full bg-red-100 px-3 py-1 text-red-800">Wrong: {summary.wrong}</span>
              <span className="rounded-full bg-orange-100 px-3 py-1 text-orange-800">Timeout: {summary.timeout}</span>
              <span className="rounded-full bg-[#1b1b1b]/10 px-3 py-1 text-[#1b1b1b]/70">Skipped: {summary.skipped}</span>
            </div>
          </div>

          <div className="mt-6 overflow-x-auto">
            <div className="mb-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {levels.map((entry) => (
                <div key={entry.domain} className="rounded-2xl border border-[#1b1b1b]/10 bg-[#f8f6f2] px-3 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#1b1b1b]/55">
                    {operatorByDomain[entry.domain]} {domainLabel[entry.domain]}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-[#1b1b1b]/85">
                    Current Lv {entry.currentLevel}
                  </p>
                  <p className="text-[11px] text-[#1b1b1b]/55">
                    Highest {entry.highestUnlockedLevel}
                  </p>
                </div>
              ))}
            </div>

            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-[#1b1b1b]/10 text-left text-xs uppercase tracking-[0.18em] text-[#1b1b1b]/55">
                  <th className="px-3 py-3">Result</th>
                  <th className="px-3 py-3">Calculation</th>
                  <th className="px-3 py-3">Submitted</th>
                  <th className="px-3 py-3">Correct answer</th>
                  <th className="px-3 py-3">Time</th>
                </tr>
              </thead>
              <tbody>
                {attempts.map((attempt) => {
                  const operator = operatorByDomain[attempt.domain];
                  const rowClass = attempt.outcome === "CORRECT"
                    ? "bg-green-50"
                    : attempt.outcome === "WRONG"
                      ? "bg-red-50"
                      : attempt.outcome === "TIMEOUT"
                        ? "bg-orange-50"
                        : "bg-[#1b1b1b]/[0.03]";

                  const resultLabel = attempt.outcome === "CORRECT"
                    ? "Correct"
                    : attempt.outcome === "WRONG"
                      ? "Wrong"
                      : attempt.outcome === "TIMEOUT"
                        ? "Timeout"
                        : "Skipped";

                  const submittedValue = attempt.outcome === "WRONG"
                    ? formatDecimal(attempt.firstSubmittedAnswer)
                    : "—";

                  return (
                    <tr key={attempt.id} className={`border-b border-[#1b1b1b]/10 ${rowClass}`}>
                      <td className="px-3 py-3 font-semibold">{resultLabel}</td>
                      <td className="px-3 py-3 font-medium">
                        {formatDecimal(attempt.leftOperand)} {operator} {formatDecimal(attempt.rightOperand)}
                      </td>
                      <td className="px-3 py-3">{submittedValue}</td>
                      <td className="px-3 py-3">{formatDecimal(attempt.expectedAnswer)}</td>
                      <td className="px-3 py-3 tabular-nums">{attempt.firstResponseMs} ms</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
}
