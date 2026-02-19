import { NextResponse } from "next/server";

import type { CalculationQuestion } from "@/features/training/types";
import { getServerSession } from "@/lib/session";

const mockCalculations: CalculationQuestion[] = [
  { left: 48, operator: "-", right: 19, answer: 29 },
  { left: 32, operator: "+", right: 27, answer: 59 },
  { left: 64, operator: "-", right: 38, answer: 26 },
  { left: 15, operator: "x", right: 4, answer: 60 },
  { left: 96, operator: "/", right: 8, answer: 12 },
  { left: 53, operator: "-", right: 26, answer: 27 },
  { left: 19, operator: "+", right: 34, answer: 53 },
  { left: 2, operator: "^", right: 5, answer: 32 },
  { left: 49, operator: "sqrt", right: null, answer: 7 },
  { left: 27, operator: "root", right: 3, answer: 3 },
];

export async function GET() {
  const session = await getServerSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ calculations: mockCalculations });
}