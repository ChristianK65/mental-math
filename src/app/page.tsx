import Link from "next/link";

import { getServerSession } from "@/lib/session";

export default async function Home() {
  const session = await getServerSession();

  return (
    <div className="min-h-screen bg-[#f8f3ea] text-[#151515]">
      <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-6 pb-16 pt-8 sm:px-10">
        <header className="flex items-center justify-between">
          <Link className="flex items-center" href="/">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-[#151515] text-xs font-bold text-white">
              S
            </span>
          </Link>
          {session ? (
            <Link
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#151515]/20 bg-white/80 transition hover:border-[#151515]/40"
              href="/dashboard"
              aria-label="Open dashboard"
            >
              <svg
                className="h-5 w-5 text-[#151515]"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.7" />
                <path
                  d="M4 20c0-3.4 3.6-6 8-6s8 2.6 8 6"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                />
              </svg>
            </Link>
          ) : (
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
          )}
        </header>

        <main className="mx-auto mt-24 w-full max-w-3xl text-center">
          <span className="inline-flex rounded-full border border-[#151515]/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#151515]/70">
            Adaptive Elo training
          </span>
          <h1 className="mt-6 text-4xl font-semibold leading-tight tracking-tight font-[var(--font-display)] sm:text-5xl">
            Train mental math with focused daily practice.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-[#151515]/70">
            Samolni keeps each session at the right difficulty, so you improve
            consistently without overtraining.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              className="inline-flex items-center justify-center rounded-full bg-[#151515] px-7 py-3 text-sm font-semibold text-white transition hover:bg-black"
              href="/training"
            >
              Start training
            </Link>
            <Link
              className="inline-flex items-center justify-center rounded-full border border-[#151515]/20 px-7 py-3 text-sm font-semibold transition hover:border-[#151515]/40"
              href="/signup"
            >
              Create account
            </Link>
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
            <h2 className="text-xl font-semibold font-[var(--font-display)]">Why Samolni</h2>
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
            <h3 className="text-xl font-semibold font-[var(--font-display)]">Start in 3 steps</h3>
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

        <section className="mt-14">
          <div className="rounded-3xl border border-[#151515]/10 bg-[#151515] p-7 text-white">
            <h2 className="text-2xl font-semibold font-[var(--font-display)]">Ready to begin?</h2>
            <p className="mt-2 text-sm text-white/75">
              Your first adaptive session is ready as soon as you sign up.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#151515]"
                href="/training"
              >
                Start training
              </Link>
              <Link
                className="inline-flex items-center justify-center rounded-full border border-white/40 px-6 py-3 text-sm font-semibold text-white/85"
                href="/login"
              >
                Sign in
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
