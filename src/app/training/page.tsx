"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function TrainingPage() {
  const questions = [
    { left: 48, operator: "-", right: 19, answer: 29 },
    { left: 32, operator: "+", right: 27, answer: 59 },
    { left: 64, operator: "-", right: 38, answer: 26 },
    { left: 15, operator: "x", right: 4, answer: 60 },
    { left: 96, operator: "/", right: 8, answer: 12 },
    { left: 53, operator: "-", right: 26, answer: 27 },
    { left: 19, operator: "+", right: 34, answer: 53 },
    { left: 2, operator: "^", right: 5, answer: 32 },
    { left: 49, operator: "sqrt", right: null, answer: 7 },
    { left: 27, operator: "root", right: 3, answer: 3 },
  ];
  const totalQuestions = questions.length;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [answerInput, setAnswerInput] = useState("");
  const [showAnswer, setShowAnswer] = useState(false);
  const [errorFlash, setErrorFlash] = useState(false);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const currentQuestion = questions[Math.min(currentIndex, questions.length - 1)];
  const router = useRouter();
  const startTimeRef = useRef<number | null>(null);

  const currentQuestionNumber = currentIndex + 1;
  const progressPercent = (currentQuestionNumber / totalQuestions) * 100;
  const progressOffset = 100 - progressPercent;

  useEffect(() => {
    if (!isTimerRunning) {
      return;
    }

    if (startTimeRef.current === null) {
      startTimeRef.current = performance.now();
    }

    const intervalId = window.setInterval(() => {
      if (startTimeRef.current === null) {
        return;
      }
      setElapsedMs(Math.round(performance.now() - startTimeRef.current));
    }, 50);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [isTimerRunning]);

  const formatElapsed = (ms: number) => {
    const seconds = ms / 1000;
    return seconds.toFixed(1);
  };

  const formatPrompt = (question: (typeof questions)[number]) => {
    if (question.operator === "sqrt") {
      return (
        <span>
          &radic;
          {question.left}
        </span>
      );
    }

    if (question.operator === "root") {
      return (
        <span>
          <sup>{question.right}</sup>
          &radic;
          {question.left}
        </span>
      );
    }

    if (question.operator === "^") {
      return (
        <span>
          {question.left}
          <sup>{question.right}</sup>
        </span>
      );
    }

    return (
      <span>
        {question.left} {question.operator} {question.right ?? ""}
      </span>
    );
  };

  const handleSubmit = (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    const expectedAnswer = currentQuestion?.answer ?? null;
    const normalized = Number(answerInput.trim());

    if (showAnswer) {
      if (currentQuestion) {
        console.log({
          question: currentQuestion,
          answer: null,
          solved: false,
          elapsedMs: null,
        });
      }
      if (currentIndex >= totalQuestions - 1) {
        setIsTimerRunning(false);
        router.push("/training/overview");
        return;
      }

      setCurrentIndex((prev) => Math.min(prev + 1, totalQuestions - 1));
      setElapsedMs(0);
      startTimeRef.current = performance.now();
      setAnswerInput("");
      setShowAnswer(false);
      setIsTimerRunning(true);
      event.currentTarget.reset();
      return;
    }

    if (expectedAnswer !== null && normalized === expectedAnswer) {
      if (currentQuestion) {
        console.log({
          question: currentQuestion,
          answer: normalized,
          solved: true,
          elapsedMs: elapsedMs,
        });
      }
      if (currentIndex >= totalQuestions - 1) {
        setIsTimerRunning(false);
        router.push("/training/overview");
        return;
      }

      setCurrentIndex((prev) => Math.min(prev + 1, totalQuestions - 1));
      setElapsedMs(0);
      startTimeRef.current = performance.now();
      setAnswerInput("");
      setShowAnswer(false);
      setIsTimerRunning(true);
      event.currentTarget.reset();
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
    setShowAnswer(true);
    setIsTimerRunning(false);
  };

  return (
    <div className="min-h-screen bg-[#f8f6f2] text-[#1b1b1b]">
      <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-6 pb-16 pt-8 sm:px-10">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-lg font-semibold tracking-tight">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#1b1b1b] text-xs font-bold text-white">
              S
            </span>
            Samolni
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
              <p className="text-4xl font-semibold">
                {currentQuestion ? formatPrompt(currentQuestion) : null}
                {showAnswer ? (
                  <span className="ml-3 text-[#1b1b1b]/60">
                    = {currentQuestion?.answer}
                  </span>
                ) : null}
              </p>
              <form
                className="mt-6 flex flex-col gap-4 sm:flex-row"
                onSubmit={handleSubmit}
              >
                <input
                  className={`w-full rounded-2xl border border-[#1b1b1b]/15 bg-white px-4 py-3 text-lg outline-none transition focus:border-[#1b1b1b]/40 ${showAnswer ? "cursor-not-allowed bg-[#f3f0eb] text-[#1b1b1b]/50" : ""} ${errorFlash ? "border-red-400 bg-red-50 ring-4 ring-red-200" : ""}`}
                  name="answer"
                  type="text"
                  inputMode="numeric"
                  placeholder="Type your answer"
                  value={answerInput}
                  onChange={(event) => {
                    setAnswerInput(event.target.value);
                  }}
                  disabled={showAnswer}
                />
                <div className="flex gap-3 sm:min-w-[240px]">
                  {!showAnswer ? (
                    <button
                      className="rounded-full border border-[#1b1b1b]/20 px-5 py-3 text-sm font-semibold transition hover:border-[#1b1b1b]/40"
                      type="button"
                      onClick={handleDontKnow}
                    >
                      Don&apos;t know
                    </button>
                  ) : null}
                  <button
                    className={`rounded-full px-6 py-3 text-sm font-semibold transition ${showAnswer ? "w-full bg-[#1b1b1b] text-white hover:bg-black" : "bg-[#1b1b1b] text-white hover:bg-black"}`}
                    type="submit"
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
