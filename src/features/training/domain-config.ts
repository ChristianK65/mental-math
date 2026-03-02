import { Domain } from "@/generated/prisma";

export const ORDERED_DOMAINS: Domain[] = [Domain.ADD, Domain.SUB, Domain.MUL, Domain.DIV];

export const DOMAIN_LABEL: Record<Domain, string> = {
  ADD: "Addition",
  SUB: "Subtraction",
  MUL: "Multiplication",
  DIV: "Division",
};

export const DOMAIN_SYMBOL: Record<Domain, string> = {
  ADD: "+",
  SUB: "−",
  MUL: "×",
  DIV: "÷",
};
