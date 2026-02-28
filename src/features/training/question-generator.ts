import { Domain, type Prisma } from "@/generated/prisma";
import type { CalculationQuestion } from "@/features/training/types";

type AddParams = {
  operation: "ADD";
  leftDigits: number;
  rightDigits: number;
  carryCount: number;
};

type MulParams = {
  operation: "MUL";
  leftDigits: number;
  rightDigits: number;
  carryCount: number;
};

type SubParams = {
  operation: "SUB";
  leftDigits: number;
  rightDigits: number;
  borrowCount: number;
  allowNegative?: boolean;
};

type DivParams = {
  operation: "DIV";
  dividendDigits: number;
  divisorDigits: number;
  exactInteger: boolean;
  minQuotient?: number;
};

type PatternParams = AddParams | MulParams | SubParams | DivParams;

type BaseQuestion = Omit<CalculationQuestion, "patternId" | "seed">;

const MAX_GENERATION_ATTEMPTS = 500;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function asDigitCount(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isInteger(value) || value < 1) {
    return null;
  }

  return value;
}

function asNonNegativeInt(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isInteger(value) || value < 0) {
    return null;
  }

  return value;
}

function parsePatternParams(value: Prisma.JsonValue): PatternParams {
  if (!isRecord(value) || typeof value.operation !== "string") {
    throw new Error("Pattern params must include an operation string");
  }

  if (value.operation === "ADD") {
    const leftDigits = asDigitCount(value.leftDigits);
    const rightDigits = asDigitCount(value.rightDigits);
    const carryCount = asNonNegativeInt(value.carryCount);

    if (!leftDigits || !rightDigits || carryCount === null) {
      throw new Error("Invalid ADD pattern params");
    }

    return { operation: "ADD", leftDigits, rightDigits, carryCount };
  }

  if (value.operation === "MUL") {
    const leftDigits = asDigitCount(value.leftDigits);
    const rightDigits = asDigitCount(value.rightDigits);
    const carryCount = asNonNegativeInt(value.carryCount);

    if (!leftDigits || !rightDigits || carryCount === null) {
      throw new Error("Invalid MUL pattern params");
    }

    return { operation: "MUL", leftDigits, rightDigits, carryCount };
  }

  if (value.operation === "SUB") {
    const leftDigits = asDigitCount(value.leftDigits);
    const rightDigits = asDigitCount(value.rightDigits);
    const borrowCount = asNonNegativeInt(value.borrowCount);
    const allowNegative = typeof value.allowNegative === "boolean" ? value.allowNegative : false;

    if (!leftDigits || !rightDigits || borrowCount === null) {
      throw new Error("Invalid SUB pattern params");
    }

    return { operation: "SUB", leftDigits, rightDigits, borrowCount, allowNegative };
  }

  if (value.operation === "DIV") {
    const dividendDigits = asDigitCount(value.dividendDigits);
    const divisorDigits = asDigitCount(value.divisorDigits);
    const exactInteger = value.exactInteger;
    const minQuotient = typeof value.minQuotient === "number" ? value.minQuotient : 1;

    if (!dividendDigits || !divisorDigits || typeof exactInteger !== "boolean") {
      throw new Error("Invalid DIV pattern params");
    }

    return {
      operation: "DIV",
      dividendDigits,
      divisorDigits,
      exactInteger,
      minQuotient,
    };
  }

  throw new Error("Unsupported pattern operation");
}

function digitBounds(digits: number) {
  if (!Number.isInteger(digits) || digits < 1) {
    throw new Error(`Invalid digit count: ${digits}`);
  }

  const min = digits === 1 ? 1 : 10 ** (digits - 1);
  const max = 10 ** digits - 1;
  return { min, max };
}

function mulberry32(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);
    value ^= value + Math.imul(value ^ (value >>> 7), 61 | value);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function randomInt(min: number, max: number, random: () => number) {
  return Math.floor(random() * (max - min + 1)) + min;
}

function countAdditionCarries(left: number, right: number) {
  let a = left;
  let b = right;
  let carry = 0;
  let count = 0;

  while (a > 0 || b > 0) {
    const sum = (a % 10) + (b % 10) + carry;
    if (sum >= 10) {
      count += 1;
      carry = 1;
    } else {
      carry = 0;
    }
    a = Math.floor(a / 10);
    b = Math.floor(b / 10);
  }

  return count;
}

function countMultiplicationCarries(left: number, right: number) {
  let multiplier = Math.abs(right);
  let carryCount = 0;

  while (multiplier > 0) {
    const digit = multiplier % 10;
    let multiplicand = Math.abs(left);
    let carry = 0;

    while (multiplicand > 0) {
      const product = (multiplicand % 10) * digit + carry;
      if (product >= 10) {
        carryCount += 1;
      }
      carry = Math.floor(product / 10);
      multiplicand = Math.floor(multiplicand / 10);
    }

    while (carry > 0) {
      if (carry >= 10) {
        carryCount += 1;
      }
      carry = Math.floor(carry / 10);
    }

    multiplier = Math.floor(multiplier / 10);
  }

  return carryCount;
}

function countSubtractionBorrows(left: number, right: number) {
  let a = left;
  let b = right;
  let borrow = 0;
  let count = 0;

  while (a > 0 || b > 0) {
    let leftDigit = (a % 10) - borrow;
    const rightDigit = b % 10;

    if (leftDigit < rightDigit) {
      leftDigit += 10;
      borrow = 1;
      count += 1;
    } else {
      borrow = 0;
    }

    a = Math.floor(a / 10);
    b = Math.floor(b / 10);
  }

  return count;
}

function maybeSwapOperands(left: number, right: number, random: () => number) {
  const leftDigits = left.toString().length;
  const rightDigits = right.toString().length;
  if (leftDigits !== rightDigits && random() < 0.5) {
    return { left: right, right: left };
  }

  return { left, right };
}

function generateAddQuestion(params: AddParams, random: () => number): BaseQuestion {
  for (let attempts = 0; attempts < MAX_GENERATION_ATTEMPTS; attempts += 1) {
    const leftBounds = digitBounds(params.leftDigits);
    const rightBounds = digitBounds(params.rightDigits);

    const rawLeft = randomInt(leftBounds.min, leftBounds.max, random);
    const rawRight = randomInt(rightBounds.min, rightBounds.max, random);
    const operands = maybeSwapOperands(rawLeft, rawRight, random);

    const carries = countAdditionCarries(operands.left, operands.right);
    if (carries !== params.carryCount) {
      continue;
    }

    return {
      left: operands.left,
      operator: "+",
      right: operands.right,
      answer: operands.left + operands.right,
    };
  }

  throw new Error("Could not generate ADD question matching constraints");
}

function generateMulQuestion(params: MulParams, random: () => number): BaseQuestion {
  for (let attempts = 0; attempts < MAX_GENERATION_ATTEMPTS; attempts += 1) {
    const leftBounds = digitBounds(params.leftDigits);
    const rightBounds = digitBounds(params.rightDigits);

    const rawLeft = randomInt(leftBounds.min, leftBounds.max, random);
    const rawRight = randomInt(rightBounds.min, rightBounds.max, random);
    const operands = maybeSwapOperands(rawLeft, rawRight, random);

    const carries = countMultiplicationCarries(operands.left, operands.right);
    if (carries !== params.carryCount) {
      continue;
    }

    return {
      left: operands.left,
      operator: "x",
      right: operands.right,
      answer: operands.left * operands.right,
    };
  }

  throw new Error("Could not generate MUL question matching constraints");
}

function generateSubQuestion(params: SubParams, random: () => number): BaseQuestion {
  for (let attempts = 0; attempts < MAX_GENERATION_ATTEMPTS; attempts += 1) {
    const leftBounds = digitBounds(params.leftDigits);
    const rightBounds = digitBounds(params.rightDigits);

    let rawLeft = randomInt(leftBounds.min, leftBounds.max, random);
    let rawRight = randomInt(rightBounds.min, rightBounds.max, random);
    const operands = maybeSwapOperands(rawLeft, rawRight, random);
    rawLeft = operands.left;
    rawRight = operands.right;

    if (!params.allowNegative && rawLeft < rawRight) {
      [rawLeft, rawRight] = [rawRight, rawLeft];
    }

    const borrows = countSubtractionBorrows(rawLeft, rawRight);
    if (borrows !== params.borrowCount) {
      continue;
    }

    return {
      left: rawLeft,
      operator: "-",
      right: rawRight,
      answer: rawLeft - rawRight,
    };
  }

  throw new Error("Could not generate SUB question matching constraints");
}

function generateDivQuestion(params: DivParams, random: () => number): BaseQuestion {
  for (let attempts = 0; attempts < MAX_GENERATION_ATTEMPTS; attempts += 1) {
    const divisorBounds = digitBounds(params.divisorDigits);
    const dividendBounds = digitBounds(params.dividendDigits);

    const divisor = randomInt(divisorBounds.min, divisorBounds.max, random);

    if (params.exactInteger) {
      const maxQuotient = Math.floor(dividendBounds.max / divisor);
      const minQuotient = Math.max(params.minQuotient ?? 1, Math.ceil(dividendBounds.min / divisor));

      if (minQuotient > maxQuotient) {
        continue;
      }

      const quotient = randomInt(minQuotient, maxQuotient, random);
      const dividend = divisor * quotient;

      return {
        left: dividend,
        operator: "/",
        right: divisor,
        answer: quotient,
      };
    }

    const dividend = randomInt(dividendBounds.min, dividendBounds.max, random);
    return {
      left: dividend,
      operator: "/",
      right: divisor,
      answer: Math.trunc(dividend / divisor),
    };
  }

  throw new Error("Could not generate DIV question matching constraints");
}

type GenerateQuestionInput = {
  domain: Domain;
  params: Prisma.JsonValue;
  seed: number;
};

export function generateQuestionFromPattern(input: GenerateQuestionInput): BaseQuestion {
  const random = mulberry32(input.seed);
  const params = parsePatternParams(input.params);

  if (input.domain === Domain.ADD && params.operation === "ADD") {
    return generateAddQuestion(params, random);
  }

  if (input.domain === Domain.MUL && params.operation === "MUL") {
    return generateMulQuestion(params, random);
  }

  if (input.domain === Domain.SUB && params.operation === "SUB") {
    return generateSubQuestion(params, random);
  }

  if (input.domain === Domain.DIV && params.operation === "DIV") {
    return generateDivQuestion(params, random);
  }

  throw new Error("Pattern domain does not match params operation");
}