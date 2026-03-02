import { useCallback, useEffect, useRef, useState } from "react";

import { persistTrainingAttempt } from "@/features/training/attempt-client";
import type { CalculationQuestion } from "@/features/training/types";
import { formatElapsed, useTrainingTimer } from "@/features/training/use-training-timer";

type FirstSubmission = {
  submittedAnswer: string;
  responseMs: number;
};

type UseTrainingRunInput = {
  questions: CalculationQuestion[];
  isLoadingQuestions: boolean;
  questionsError: string | null;
  runId: string;
  onComplete: (runId: string) => void;
};

export function useTrainingRun({
  questions,
  isLoadingQuestions,
  questionsError,
  runId,
  onComplete,
}: UseTrainingRunInput) {
  const { elapsedMs, restart, stop } = useTrainingTimer();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answerInput, setAnswerInput] = useState("");
  const [showAnswer, setShowAnswer] = useState(false);
  const [errorFlash, setErrorFlash] = useState(false);
  const [isSubmittingAttempt, setIsSubmittingAttempt] = useState(false);
  const [firstSubmission, setFirstSubmission] = useState<FirstSubmission | null>(null);
  const skipResponseMsRef = useRef<number | null>(null);
  const answerInputRef = useRef<HTMLInputElement | null>(null);

  const totalQuestions = questions.length;
  const hasLoadedQuestions = !isLoadingQuestions && !questionsError && totalQuestions > 0;
  const currentQuestion = totalQuestions > 0
    ? questions[Math.min(currentIndex, totalQuestions - 1)]
    : undefined;
  const isInteractionDisabled = !hasLoadedQuestions || isSubmittingAttempt;
  const currentQuestionNumber = totalQuestions > 0 ? Math.min(currentIndex + 1, totalQuestions) : 0;
  const progressPercent = totalQuestions > 0 ? (currentQuestionNumber / totalQuestions) * 100 : 0;
  const progressOffset = 100 - progressPercent;

  const focusAnswerInput = useCallback(() => {
    window.requestAnimationFrame(() => {
      answerInputRef.current?.focus();
    });
  }, []);

  useEffect(() => {
    if (!hasLoadedQuestions) {
      stop();
      return;
    }

    restart();
    focusAnswerInput();
  }, [hasLoadedQuestions, focusAnswerInput, restart, stop]);

  const resetQuestionState = useCallback((form: HTMLFormElement) => {
    setAnswerInput("");
    setShowAnswer(false);
    setFirstSubmission(null);
    skipResponseMsRef.current = null;
    form.reset();
    focusAnswerInput();
  }, [focusAnswerInput]);

  const advanceOrFinish = useCallback((form: HTMLFormElement) => {
    if (currentIndex >= totalQuestions - 1) {
      stop();
      onComplete(runId);
      return;
    }

    setCurrentIndex((prev) => Math.min(prev + 1, totalQuestions - 1));
    restart();
    resetQuestionState(form);
  }, [currentIndex, onComplete, resetQuestionState, restart, runId, stop, totalQuestions]);

  const persistCurrentAttempt = useCallback(async ({
    firstSubmittedAnswer,
    firstResponseMs,
    skipped,
  }: {
    firstSubmittedAnswer: string | null;
    firstResponseMs: number;
    skipped: boolean;
  }) => {
    if (!currentQuestion) {
      return;
    }

    try {
      setIsSubmittingAttempt(true);
      await persistTrainingAttempt({
        runId,
        patternId: currentQuestion.patternId,
        seed: currentQuestion.seed,
        firstSubmittedAnswer,
        firstResponseMs,
        skipped,
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmittingAttempt(false);
    }
  }, [currentQuestion, runId]);

  const submitAnswer = useCallback(async (form: HTMLFormElement) => {
    if (!currentQuestion || isSubmittingAttempt) {
      return;
    }

    const expectedAnswer = currentQuestion.answer;
    const trimmedAnswer = answerInput.trim();
    const numericAnswer = Number(trimmedAnswer);

    if (showAnswer) {
      const lockedSubmission = firstSubmission;

      await persistCurrentAttempt({
        firstSubmittedAnswer: lockedSubmission ? lockedSubmission.submittedAnswer : null,
        firstResponseMs: lockedSubmission ? lockedSubmission.responseMs : (skipResponseMsRef.current ?? elapsedMs),
        skipped: !lockedSubmission,
      });
      advanceOrFinish(form);
      return;
    }

    if (trimmedAnswer === "" || Number.isNaN(numericAnswer)) {
      return;
    }

    if (!firstSubmission) {
      setFirstSubmission({
        submittedAnswer: trimmedAnswer,
        responseMs: elapsedMs,
      });
    }

    if (numericAnswer === expectedAnswer) {
      const lockedSubmission = firstSubmission ?? {
        submittedAnswer: trimmedAnswer,
        responseMs: elapsedMs,
      };

      await persistCurrentAttempt({
        firstSubmittedAnswer: lockedSubmission.submittedAnswer,
        firstResponseMs: lockedSubmission.responseMs,
        skipped: false,
      });
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
  }, [
    advanceOrFinish,
    answerInput,
    currentQuestion,
    elapsedMs,
    firstSubmission,
    isSubmittingAttempt,
    persistCurrentAttempt,
    showAnswer,

  ]);

  const markDontKnow = useCallback(() => {
    if (!currentQuestion || isSubmittingAttempt) {
      return;
    }

    setShowAnswer(true);
    skipResponseMsRef.current = elapsedMs;
    stop();
  }, [currentQuestion, isSubmittingAttempt, stop]);

  return {
    answerInput,
    answerInputRef,
    currentQuestion,
    currentQuestionNumber,
    elapsedMs,
    errorFlash,
    hasLoadedQuestions,
    isInteractionDisabled,
    markDontKnow,
    progressOffset,
    questionsError,
    isLoadingQuestions,
    setAnswerInput,
    showAnswer,
    submitAnswer,
    totalQuestions,
  };
}