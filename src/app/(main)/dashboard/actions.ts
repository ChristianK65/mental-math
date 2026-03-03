"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function startTraining(formData: FormData) {
  const operations = formData.getAll("operations") as string[];
  const count = (formData.get("count") as string) ?? "10";

  const cookieStore = await cookies();
  cookieStore.set("training-settings", JSON.stringify({ operations, count }), {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    httpOnly: false,
    sameSite: "lax",
  });

  const params = new URLSearchParams();
  for (const op of operations) {
    params.append("operations", op);
  }
  params.set("count", count);

  redirect(`/training?${params.toString()}`);
}
