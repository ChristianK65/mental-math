import { useEffect, useState } from "react";

import type { CalculationQuestion } from "@/features/training/types";

type TrainingQuestionsResponse = {
  calculations?: CalculationQuestion[];
};

export function useTrainingQuestions(selectedOperations: string[], selectedCount: string) {
  const [questions, setQuestions] = useState<CalculationQuestion[]>([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);
  const [questionsError, setQuestionsError] = useState<string | null>(null);

  const operationsKey = selectedOperations.join("|");
  const countKey = selectedCount;

  useEffect(() => {
    const controller = new AbortController();

    const loadQuestions = async () => {
      try {
        setIsLoadingQuestions(true);
        setQuestionsError(null);

        const params = new URLSearchParams();
        const operations = operationsKey.length > 0 ? operationsKey.split("|") : [];
        operations.forEach((operation) => {
          params.append("operations", operation);
        });
        params.set("count", countKey);

        const query = params.toString();
        const endpoint = query.length > 0
          ? `/api/training/calculations?${query}`
          : "/api/training/calculations";

        const response = await fetch(endpoint, {
          signal: controller.signal,
        });

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error("You need to log in to start training.");
          }

          throw new Error(`Could not load training calculations (${response.status}).`);
        }

        const data: TrainingQuestionsResponse = await response.json();
        const incoming = Array.isArray(data.calculations) ? data.calculations : [];
        setQuestions(incoming);
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        setQuestions([]);
        setQuestionsError(error instanceof Error ? error.message : "Could not load training calculations. Please refresh.");
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
  }, [operationsKey, countKey]);

  return {
    questions,
    isLoadingQuestions,
    questionsError,
  };
}
