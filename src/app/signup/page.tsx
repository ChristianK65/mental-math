import { redirect } from "next/navigation";

import { SignUpForm } from "@/components/auth/signup-form";
import { getServerSession } from "@/lib/session";

export default async function SignUpPage() {
  const session = await getServerSession();
  const isAnonymous = (session?.user as { isAnonymous?: boolean } | undefined)?.isAnonymous === true;

  if (session && !isAnonymous) {
    redirect("/dashboard");
  }

  return <SignUpForm />;
}
