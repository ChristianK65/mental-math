export type CalculationOperator = "+" | "-" | "x" | "/" | "^" | "sqrt" | "root";

export type CalculationQuestion = {
  patternId: string;
  seed: number;
  left: number;
  operator: CalculationOperator;
  right: number | null;
  answer: number;
};
