import { redirect } from "next/navigation";

import { SignUpForm } from "@/components/auth/signup-form";
import { getServerSession } from "@/lib/session";

export default async function SignUpPage() {
  const session = await getServerSession();

  if (session) {
    redirect("/dashboard");
  }

  return <SignUpForm />;
}
