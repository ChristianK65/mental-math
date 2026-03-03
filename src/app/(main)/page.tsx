import { redirect } from "next/navigation";

import { GuestStartButton } from "@/components/guest-start-button";
import { isAnonymousUser } from "@/lib/auth-helpers";
import { getServerSession } from "@/lib/session";

export default async function Home() {
  const session = await getServerSession();
  const isAnonymous = isAnonymousUser(session?.user);
  const isRegularUser = !!session && !isAnonymous;

  if (isRegularUser) {
    redirect("/dashboard");
  }

  return (
    <main className="mx-auto mt-16 w-full max-w-3xl px-6 pb-16 text-center sm:px-10">
          <span className="inline-flex rounded-full border border-[#151515]/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#151515]/70">
            Adaptive training
          </span>
          <h1 className="mt-6 text-4xl font-semibold leading-tight tracking-tight font-display sm:text-5xl">
            Train mental math with focused daily practice.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-[#151515]/70">
            Samolni keeps each session at the right difficulty, so you improve
            consistently without overtraining.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <GuestStartButton />
          </div>

          <div className="mt-14 flex flex-wrap justify-center gap-3 text-left">
            {[
              { value: "Adaptive", label: "Smart difficulty" },
              { value: "Fast", label: "Feedback loop" },
              { value: "Clear", label: "Progress view" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="w-36 rounded-2xl border border-[#151515]/10 bg-white/70 p-4"
              >
                <p className="text-xl font-semibold">{stat.value}</p>
                <p className="text-sm text-[#151515]/65">{stat.label}</p>
              </div>
            ))}
          </div>
    </main>
  );
}
