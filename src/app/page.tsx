import Link from "next/link";
import { redirect } from "next/navigation";

import { BrandMark } from "@/components/brand-mark";
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
    <div className="min-h-screen bg-[#f8f3ea] text-[#151515]">
      <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-6 pb-16 pt-8 sm:px-10">
        <header className="flex items-center justify-between">
          <Link className="flex items-center" href="/">
            <BrandMark />
          </Link>
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Link className="rounded-full px-4 py-2" href="/login">
              Sign in
            </Link>
            <Link
              className="rounded-full border border-[#151515]/20 px-4 py-2 transition hover:border-[#151515]/40"
              href="/signup"
            >
              Create account
            </Link>
          </div>
        </header>

        <main className="mx-auto mt-24 w-full max-w-3xl text-center">
          <span className="inline-flex rounded-full border border-[#151515]/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#151515]/70">
            Adaptive Elo training
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

          <div className="mt-14 grid grid-cols-2 gap-3 text-left sm:grid-cols-4">
            {[
              { value: "5 min", label: "Daily sessions" },
              { value: "Elo", label: "Adaptive difficulty" },
              { value: "Fast", label: "Feedback loop" },
              { value: "Clear", label: "Progress view" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-[#151515]/10 bg-white/70 p-4"
              >
                <p className="text-xl font-semibold">{stat.value}</p>
                <p className="text-sm text-[#151515]/65">{stat.label}</p>
              </div>
            ))}
          </div>
        </main>

        <section className="mt-20 grid gap-5 lg:grid-cols-2">
          <div className="rounded-3xl border border-[#151515]/10 bg-white/80 p-7">
            <h2 className="text-xl font-semibold font-display">Why Samolni</h2>
            <p className="mt-3 text-sm leading-7 text-[#151515]/70">
              Short sessions, calibrated problem difficulty, and quick review
              cycles keep your training sustainable and effective.
            </p>
            <ul className="mt-5 grid gap-2 text-sm text-[#151515]/75">
              <li>Calibrated by Elo</li>
              <li>Built for daily focus</li>
              <li>Designed for measurable progress</li>
            </ul>
          </div>

          <div className="rounded-3xl border border-[#151515]/10 bg-white/80 p-7">
            <h2 className="text-xl font-semibold font-display">Start in 3 steps</h2>
            <ol className="mt-5 grid gap-3 text-sm text-[#151515]/75">
              {[
                "Create your account",
                "Take a quick rating check",
                "Complete your first 5-minute session",
              ].map((step, index) => (
                <li
                  key={step}
                  className="flex items-center gap-3 rounded-2xl border border-[#151515]/10 bg-[#f8f3ea] px-4 py-3"
                >
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#151515] text-xs font-semibold text-white">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>
      </div>
    </div>
  );
}
