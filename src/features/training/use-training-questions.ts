import { useEffect, useState } from "react";

import type { CalculationQuestion } from "@/features/training/types";

type TrainingQuestionsResponse = {
  calculations?: CalculationQuestion[];
};

export function useTrainingQuestions() {
  const [questions, setQuestions] = useState<CalculationQuestion[]>([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);
  const [questionsError, setQuestionsError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const loadQuestions = async () => {
      try {
        setIsLoadingQuestions(true);
        setQuestionsError(null);

        const response = await fetch("/api/training/calculations", {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Failed to load questions (${response.status})`);
        }

        const data: TrainingQuestionsResponse = await response.json();
        const incoming = Array.isArray(data.calculations) ? data.calculations : [];
        setQuestions(incoming);
      } catch {
        if (controller.signal.aborted) {
          return;
        }

        setQuestions([]);
        setQuestionsError("Could not load training calculations. Please refresh.");
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingQuestions(false);
        }
      }
    };

    void loadQuestions();

    return () => {
      controller.abort();
    };
  }, []);

  return {
    questions,
    isLoadingQuestions,
    questionsError,
  };
}
