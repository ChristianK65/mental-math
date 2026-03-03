"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { BrandMark } from "@/components/brand-mark";
import { formatElapsed } from "@/features/training/use-training-timer";
import { formatPrompt } from "@/features/training/format-prompt";
import { useTrainingQuestions } from "@/features/training/use-training-questions";
import { useTrainingRun } from "@/features/training/use-training-run";
import { cn } from "@/lib/cn";

function TrainingPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [runId] = useState(() => crypto.randomUUID());
  const selectedOperations = searchParams.getAll("operations");
  const selectedCount = searchParams.get("count") ?? "10";

  useEffect(() => {
    if (selectedOperations.length === 0) return;
    const settings = JSON.stringify({ operations: selectedOperations, count: selectedCount });
    document.cookie = `training-settings=${encodeURIComponent(settings)}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedOperations.join(","), selectedCount]);

  const { questions, isLoadingQuestions, questionsError } = useTrainingQuestions(selectedOperations, selectedCount);
  const handleRunComplete = useCallback((completedRunId: string) => {
    router.push(`/training/overview?runId=${encodeURIComponent(completedRunId)}`);
  }, [router]);

  const {
    answerInput,
    answerInputRef,
    currentQuestion,
    currentQuestionNumber,
    elapsedMs,
    errorFlash,
    isInteractionDisabled,
    markDontKnow,
    progressOffset,
    setAnswerInput,
    showAnswer,
    submitAnswer,
    totalQuestions,
  } = useTrainingRun({
    questions,
    isLoadingQuestions,
    questionsError,
    runId,
    onComplete: handleRunComplete,
  });

  const answerInputClassName = cn(
    "w-full rounded-2xl border border-[#1b1b1b]/15 bg-white px-4 py-3 text-lg outline-none transition focus:border-[#1b1b1b]/40",
    showAnswer && "cursor-not-allowed bg-[#f3f0eb] text-[#1b1b1b]/50",
    errorFlash && "border-red-400 bg-red-50 ring-4 ring-red-200",
  );

  return (
    <div className="min-h-screen bg-[#f8f3ea] text-[#1b1b1b]">
      <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-6 pb-16 pt-8 sm:px-10">
        <header className="flex items-center justify-between">
          <div className="flex items-center">
            <BrandMark />
          </div>
          <div className="flex items-center gap-3 text-sm font-medium">
            <Link className="rounded-full px-3 py-2" href="/">
              Home
            </Link>
          </div>
        </header>

        <main className="mt-16">
          <div className="rounded-3xl border border-[#1b1b1b]/10 bg-white p-8">
            <div className="flex flex-wrap items-center justify-between gap-6 text-sm">
              <div className="flex items-center gap-4">
                <div className="relative size-16">
                  <svg viewBox="0 0 36 36" className="size-16">
                    <circle
                      className="text-[#1b1b1b]/10"
                      cx="18"
                      cy="18"
                      r="16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                    />
                    <circle
                      className="text-[#1b1b1b]"
                      cx="18"
                      cy="18"
                      r="16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeDasharray="100"
                      strokeDashoffset={progressOffset}
                      strokeLinecap="round"
                      transform="rotate(-90 18 18)"
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold">
                    {currentQuestionNumber}/{totalQuestions}
                  </span>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-[#1b1b1b]/60">
                    Question
                  </p>
                  <p className="mt-2 text-sm text-[#1b1b1b]/60">
                    Focus on accuracy, speed follows.
                  </p>
                </div>
              </div>
              <span className="rounded-full border border-[#1b1b1b]/20 px-3 py-1 font-mono tabular-nums">
                Elapsed: <span className="inline-block w-[6ch] text-right">{formatElapsed(elapsedMs)}s</span>
              </span>
            </div>

            <div className="mt-12">
              {isLoadingQuestions ? (
                <p className="text-base text-[#1b1b1b]/60">Loading questions…</p>
              ) : null}
              {!isLoadingQuestions && questionsError ? (
                <p className="text-base text-[#1b1b1b]/60">{questionsError}</p>
              ) : null}
              {!isLoadingQuestions && !questionsError && totalQuestions === 0 ? (
                <p className="text-base text-[#1b1b1b]/60">No questions available right now.</p>
              ) : null}
              <p className="text-4xl font-semibold">
                {!isLoadingQuestions && !questionsError && currentQuestion ? formatPrompt(currentQuestion) : null}
                {showAnswer ? (
                  <span className="ml-3 text-[#1b1b1b]/60">
                    = {currentQuestion?.answer}
                  </span>
                ) : null}
              </p>
              <form
                className="mt-6 flex flex-col gap-4 sm:flex-row"
                onSubmit={(event) => {
                  event.preventDefault();
                  void submitAnswer(event.currentTarget);
                }}
              >
                <input
                  ref={answerInputRef}
                  className={answerInputClassName}
                  name="answer"
                  type="text"
                  inputMode="numeric"
                  placeholder="Type your answer"
                  value={answerInput}
                  onChange={(event) => {
                    setAnswerInput(event.target.value);
                  }}
                  disabled={showAnswer || isInteractionDisabled}
                />
                <div className="flex gap-3 sm:min-w-[240px]">
                  {!showAnswer ? (
                    <button
                      className="rounded-full border border-[#1b1b1b]/20 px-5 py-3 text-sm font-semibold transition hover:border-[#1b1b1b]/40"
                      type="button"
                      onClick={markDontKnow}
                      disabled={isInteractionDisabled}
                    >
                      Don&apos;t know
                    </button>
                  ) : null}
                  <button
                    className={cn("rounded-full bg-[#1b1b1b] px-6 py-3 text-sm font-semibold text-white transition hover:bg-black", showAnswer && "w-full")}
                    type="submit"
                    disabled={isInteractionDisabled}
                  >
                    {showAnswer ? "Continue" : "Submit"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function TrainingPage() {
  return (
    <Suspense>
      <TrainingPageContent />
    </Suspense>
  );
}