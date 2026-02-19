export type CalculationOperator = "+" | "-" | "x" | "/" | "^" | "sqrt" | "root";

export type CalculationQuestion = {
  left: number;
  operator: CalculationOperator;
  right: number | null;
  answer: number;
};
