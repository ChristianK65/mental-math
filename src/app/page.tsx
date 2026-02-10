import Link from "next/link";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f6f1ea] text-[#1b1b1b]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(255,201,120,0.35),transparent_40%),radial-gradient(circle_at_85%_20%,rgba(120,205,255,0.32),transparent_45%),radial-gradient(circle_at_70%_80%,rgba(255,132,164,0.28),transparent_45%)]" />
      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 pb-20 pt-8 sm:px-10">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-lg font-semibold tracking-tight">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#1b1b1b] text-xs font-bold text-white">
              S
            </span>
            Samolni
          </div>
          <div className="flex items-center gap-3 text-sm font-medium">
            <a className="hidden sm:inline" href="#how">
              How it works
            </a>
            <a className="hidden sm:inline" href="#features">
              Features
            </a>
            <Link
              className="rounded-full border border-[#1b1b1b]/20 px-4 py-2 transition hover:border-[#1b1b1b]/40"
              href="/signup"
            >
              Get started
            </Link>
            <Link className="rounded-full px-3 py-2" href="/login">
              Log in
            </Link>
            <Link className="rounded-full px-3 py-2" href="/training">
              Training
            </Link>
          </div>
        </header>

        <main className="mt-16 grid gap-14 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="flex flex-col gap-8">
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-[#1b1b1b] px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-white">
                Elo-paced training
              </span>
              <span className="text-sm text-[#1b1b1b]/70">
                Focused. Fast. Measurable.
              </span>
            </div>
            <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl font-[var(--font-display)]">
              Build mental math intuition in minutes a day.
            </h1>
            <p className="max-w-xl text-lg leading-8 text-[#1b1b1b]/75">
              Samolni adapts every session using an Elo-based difficulty ladder.
              You always get problems that are just challenging enough to level
              up without burning out.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <a
                className="inline-flex items-center justify-center rounded-full bg-[#1b1b1b] px-6 py-3 text-sm font-semibold text-white transition hover:bg-black"
                href="#start"
              >
                Start training
              </a>
              <a
                className="inline-flex items-center justify-center rounded-full border border-[#1b1b1b]/20 px-6 py-3 text-sm font-semibold transition hover:border-[#1b1b1b]/40"
                href="#features"
              >
                Explore the system
              </a>
            </div>
            <div className="grid grid-cols-3 gap-6 text-sm">
              <div className="rounded-2xl border border-[#1b1b1b]/10 bg-white/70 p-4">
                <p className="text-2xl font-semibold">5 min</p>
                <p className="text-[#1b1b1b]/65">Daily sessions</p>
              </div>
              <div className="rounded-2xl border border-[#1b1b1b]/10 bg-white/70 p-4">
                <p className="text-2xl font-semibold">Elo 900+</p>
                <p className="text-[#1b1b1b]/65">From novice to sharp</p>
              </div>
              <div className="rounded-2xl border border-[#1b1b1b]/10 bg-white/70 p-4">
                <p className="text-2xl font-semibold">Live streaks</p>
                <p className="text-[#1b1b1b]/65">Never lose momentum</p>
              </div>
            </div>
          </section>

          <section className="flex flex-col gap-6">
            <div className="rounded-3xl border border-[#1b1b1b]/10 bg-white/80 p-6 shadow-[0_30px_80px_rgba(27,27,27,0.12)]">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold">Today</span>
                <span className="text-[#1b1b1b]/60">Session 4 of 5</span>
              </div>
              <div className="mt-8 rounded-2xl border border-[#1b1b1b]/10 bg-[#f6f1ea] p-6">
                <p className="text-xs uppercase tracking-[0.24em] text-[#1b1b1b]/60">
                  Challenge
                </p>
                <p className="mt-2 text-3xl font-semibold">48 - 19</p>
                <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
                  {[
                    "25",
                    "29",
                    "31",
                    "32",
                  ].map((answer) => (
                    <div
                      key={answer}
                      className="rounded-2xl border border-[#1b1b1b]/10 bg-white px-4 py-3 text-center font-semibold"
                    >
                      {answer}
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-6 flex items-center justify-between text-sm">
                <div>
                  <p className="font-semibold">Elo</p>
                  <p className="text-[#1b1b1b]/60">1120 - steady climb</p>
                </div>
                <div className="rounded-full border border-[#1b1b1b]/20 px-4 py-2">
                  00:42
                </div>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-[#1b1b1b]/10 bg-white/80 p-5">
                <p className="text-sm font-semibold">Adaptive ladder</p>
                <p className="mt-2 text-sm text-[#1b1b1b]/65">
                  Each correct streak nudges the Elo band upward. Misses cool it
                  down so the next prompt is always learnable.
                </p>
              </div>
              <div className="rounded-2xl border border-[#1b1b1b]/10 bg-white/80 p-5">
                <p className="text-sm font-semibold">Post-session review</p>
                <p className="mt-2 text-sm text-[#1b1b1b]/65">
                  Review mistakes with a single tap and lock in the mental
                  shortcuts that matter.
                </p>
              </div>
            </div>
          </section>
        </main>

        <section id="features" className="mt-20 grid gap-8 lg:grid-cols-3">
          {[
            {
              title: "Elo-based scheduling",
              body: "Problems are pulled from a difficulty range that tracks your rating.",
            },
            {
              title: "Skill clusters",
              body: "Train addition, subtraction, multiplication, and mixed drills with separate ratings.",
            },
            {
              title: "Momentum checks",
              body: "Short bursts keep you in flow while avoiding fatigue and burnout.",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="rounded-3xl border border-[#1b1b1b]/10 bg-white/80 p-6"
            >
              <h3 className="text-lg font-semibold">{feature.title}</h3>
              <p className="mt-3 text-sm text-[#1b1b1b]/65">{feature.body}</p>
            </div>
          ))}
        </section>

        <section
          id="how"
          className="mt-20 rounded-3xl border border-[#1b1b1b]/10 bg-white/80 p-8"
        >
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#1b1b1b]/60">
                How it works
              </p>
              <h2 className="mt-3 text-2xl font-semibold font-[var(--font-display)]">
                Short sessions. Clear feedback. Visible growth.
              </h2>
              <p className="mt-4 text-sm text-[#1b1b1b]/65">
                Samolni uses a light-weight Elo rating for each skill. The
                trainer picks problems near your current level, then
                recalibrates at the end of every session.
              </p>
            </div>
            <div className="grid gap-4">
              {[
                "Warm up with 3 rapid questions",
                "Train the core set for 4 minutes",
                "Review two mistakes and save a note",
              ].map((step, index) => (
                <div
                  key={step}
                  className="flex items-start gap-4 rounded-2xl border border-[#1b1b1b]/10 bg-[#f6f1ea] p-4"
                >
                  <span className="mt-1 inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#1b1b1b] text-xs font-semibold text-white">
                    {index + 1}
                  </span>
                  <p className="text-sm text-[#1b1b1b]/75">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="start" className="mt-20">
          <div className="flex flex-col items-start justify-between gap-6 rounded-3xl border border-[#1b1b1b]/10 bg-[#1b1b1b] p-8 text-white lg:flex-row">
            <div>
              <h2 className="text-2xl font-semibold font-[var(--font-display)]">
                Ready to build your mental math streak?
              </h2>
              <p className="mt-2 text-sm text-white/70">
                Create your profile and get your first Elo rating in under two
                minutes.
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#1b1b1b]"
                href="/signup"
              >
                Create account
              </Link>
              <Link
                className="inline-flex items-center justify-center rounded-full border border-white/40 px-6 py-3 text-sm font-semibold text-white/80"
                href="/login"
              >
                Log in
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
