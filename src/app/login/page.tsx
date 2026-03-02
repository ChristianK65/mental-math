import { redirect } from "next/navigation";

import { LoginForm } from "@/components/auth/login-form";
import { isAnonymousUser } from "@/lib/auth-helpers";
import { getServerSession } from "@/lib/session";

export default async function LoginPage() {
  const session = await getServerSession();

  if (session && !isAnonymousUser(session.user)) {
    redirect("/dashboard");
  }

  return <LoginForm />;
}
