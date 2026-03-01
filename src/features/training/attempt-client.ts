import type { PersistAttemptInput } from "@/features/training/attempt-types";

export async function persistTrainingAttempt(input: PersistAttemptInput) {
  const response = await fetch("/api/training/attempts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(`Failed to persist attempt (${response.status})`);
  }
}
