import { useEffect, useState } from "react";

import type { CalculationQuestion } from "@/features/training/types";

type TrainingQuestionsResponse = {
  calculations?: CalculationQuestion[];
};

export function useTrainingQuestions(selectedOperations: string[], selectedCount: string) {
  const [questions, setQuestions] = useState<CalculationQuestion[]>([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);
  const [questionsError, setQuestionsError] = useState<string | null>(null);

  const operationsKey = selectedOperations.join(",");

  useEffect(() => {
    const controller = new AbortController();

    const loadQuestions = async () => {
      try {
        setIsLoadingQuestions(true);
        setQuestionsError(null);

        const params = new URLSearchParams();
        selectedOperations.forEach((op) => {
          params.append("operations", op);
        });
        params.set("count", selectedCount);

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
  }, [operationsKey, selectedCount]);

  return {
    questions,
    isLoadingQuestions,
    questionsError,
  };
}
