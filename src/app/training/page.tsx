"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { formatPrompt } from "@/features/training/format-prompt";
import { persistTrainingAttempt } from "@/features/training/attempt-client";
import { useTrainingQuestions } from "@/features/training/use-training-questions";
import { useTrainingTimer } from "@/features/training/use-training-timer";

export default function TrainingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [runId] = useState(() => crypto.randomUUID());
  const selectedOperations = searchParams.getAll("operations");
  const selectedCount = searchParams.get("count") ?? "10";
  const { questions, isLoadingQuestions, questionsError } = useTrainingQuestions(selectedOperations, selectedCount);
  const { elapsedMs, restart, stop, formatElapsed } = useTrainingTimer();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answerInput, setAnswerInput] = useState("");
  const [showAnswer, setShowAnswer] = useState(false);
  const [errorFlash, setErrorFlash] = useState(false);
  const [isSubmittingAttempt, setIsSubmittingAttempt] = useState(false);
  const answerInputRef = useRef<HTMLInputElement | null>(null);
  const [firstSubmission, setFirstSubmission] = useState<{
    submittedAnswer: string;
    responseMs: number;
  } | null>(null);
  const [skipResponseMs, setSkipResponseMs] = useState<number | null>(null);

  const totalQuestions = questions.length;
  const hasLoadedQuestions = !isLoadingQuestions && !questionsError && totalQuestions > 0;
  const currentQuestion = questions.length > 0
    ? questions[Math.min(currentIndex, questions.length - 1)]
    : undefined;
  const isInteractionDisabled = !hasLoadedQuestions || isSubmittingAttempt;
  const currentQuestionNumber = currentIndex + 1;
  const progressPercent = totalQuestions > 0 ? (currentQuestionNumber / totalQuestions) * 100 : 0;
  const progressOffset = 100 - progressPercent;

  useEffect(() => {
    if (!hasLoadedQuestions) {
      stop();
      return;
    }

    restart();
    window.requestAnimationFrame(() => {
      answerInputRef.current?.focus();
    });
  }, [hasLoadedQuestions, restart, stop]);

  const advanceOrFinish = (form: HTMLFormElement) => {
    if (currentIndex >= totalQuestions - 1) {
      stop();
      router.push(`/training/overview?runId=${encodeURIComponent(runId)}`);
      return;
    }

    setCurrentIndex((prev) => Math.min(prev + 1, totalQuestions - 1));
    restart();
    setAnswerInput("");
    setShowAnswer(false);
    setFirstSubmission(null);
    setSkipResponseMs(null);
    form.reset();
    window.requestAnimationFrame(() => {
      answerInputRef.current?.focus();
    });
  };

  const handleSubmit = async (form: HTMLFormElement) => {
    if (!currentQuestion || isSubmittingAttempt) {
      return;
    }

    const expectedAnswer = currentQuestion.answer;
    const trimmedAnswer = answerInput.trim();
    const normalized = Number(trimmedAnswer);

    if (showAnswer) {
      const lockedSubmission = firstSubmission;

      try {
        setIsSubmittingAttempt(true);
        await persistTrainingAttempt({
          runId,
          patternId: currentQuestion.patternId,
          seed: currentQuestion.seed,
          firstSubmittedAnswer: lockedSubmission ? lockedSubmission.submittedAnswer : null,
          firstResponseMs: lockedSubmission ? lockedSubmission.responseMs : (skipResponseMs ?? elapsedMs),
          skipped: lockedSubmission ? false : true,
        });
      } catch (error) {
        console.error(error);
      } finally {
        setIsSubmittingAttempt(false);
      }
      advanceOrFinish(form);
      return;
    }

    if (trimmedAnswer === "" || Number.isNaN(normalized)) {
      return;
    }

    if (!firstSubmission) {
      setFirstSubmission({
        submittedAnswer: trimmedAnswer,
        responseMs: elapsedMs,
      });
    }

    if (normalized === expectedAnswer) {
      const lockedSubmission = firstSubmission ?? {
        submittedAnswer: trimmedAnswer,
        responseMs: elapsedMs,
      };

      try {
        setIsSubmittingAttempt(true);
        await persistTrainingAttempt({
          runId,
          patternId: currentQuestion.patternId,
          seed: currentQuestion.seed,
          firstSubmittedAnswer: lockedSubmission.submittedAnswer,
          firstResponseMs: lockedSubmission.responseMs,
          skipped: false,
        });
      } catch (error) {
        console.error(error);
      } finally {
        setIsSubmittingAttempt(false);
      }

      advanceOrFinish(form);
      return;
    }

    setErrorFlash(false);
    window.requestAnimationFrame(() => {
      setErrorFlash(true);
    });
    window.setTimeout(() => {
      setErrorFlash(false);
    }, 500);
  };

  const handleDontKnow = () => {
    if (!currentQuestion || isSubmittingAttempt) {
      return;
    }

    setShowAnswer(true);
    setSkipResponseMs(elapsedMs);
    stop();
  };

  return (
    <div className="min-h-screen bg-[#f8f6f2] text-[#1b1b1b]">
      <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-6 pb-16 pt-8 sm:px-10">
        <header className="flex items-center justify-between">
          <div className="flex items-center text-lg font-semibold tracking-tight">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#1b1b1b] text-xs font-bold text-white">
              S
            </span>
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
                <div className="relative h-16 w-16">
                  <svg viewBox="0 0 36 36" className="h-16 w-16">
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
                  void handleSubmit(event.currentTarget);
                }}
              >
                <input
                  ref={answerInputRef}
                  className={`w-full rounded-2xl border border-[#1b1b1b]/15 bg-white px-4 py-3 text-lg outline-none transition focus:border-[#1b1b1b]/40 ${showAnswer ? "cursor-not-allowed bg-[#f3f0eb] text-[#1b1b1b]/50" : ""} ${errorFlash ? "border-red-400 bg-red-50 ring-4 ring-red-200" : ""}`}
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
                      onClick={handleDontKnow}
                      disabled={isInteractionDisabled}
                    >
                      Don&apos;t know
                    </button>
                  ) : null}
                  <button
                    className={`rounded-full px-6 py-3 text-sm font-semibold transition ${showAnswer ? "w-full bg-[#1b1b1b] text-white hover:bg-black" : "bg-[#1b1b1b] text-white hover:bg-black"}`}
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