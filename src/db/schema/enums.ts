import { pgEnum } from "drizzle-orm/pg-core";

export const domainEnum = pgEnum("domain", ["ADD", "MUL", "SUB", "DIV"]);

export const Domain = {
  ADD: "ADD",
  MUL: "MUL",
  SUB: "SUB",
  DIV: "DIV",
} as const;

export type Domain = (typeof Domain)[keyof typeof Domain];

export const attemptOutcomeEnum = pgEnum("attempt_outcome", [
  "CORRECT",
  "WRONG",
  "TIMEOUT",
  "SKIPPED",
]);

export const AttemptOutcome = {
  CORRECT: "CORRECT",
  WRONG: "WRONG",
  TIMEOUT: "TIMEOUT",
  SKIPPED: "SKIPPED",
} as const;

export type AttemptOutcome = (typeof AttemptOutcome)[keyof typeof AttemptOutcome];
