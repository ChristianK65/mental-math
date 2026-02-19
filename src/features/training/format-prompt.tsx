import type { CalculationQuestion } from "@/features/training/types";

export function formatPrompt(question: CalculationQuestion) {
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
}