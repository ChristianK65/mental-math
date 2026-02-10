import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f6f1ea] text-[#1b1b1b]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(120,205,255,0.32),transparent_40%),radial-gradient(circle_at_85%_75%,rgba(255,132,164,0.28),transparent_45%)]" />
      <div className="relative mx-auto flex min-h-screen w-full max-w-5xl flex-col justify-center px-6 py-16 sm:px-10">
        <div className="grid gap-10 lg:grid-cols-[1fr_0.9fr]">
          <section className="flex flex-col justify-center gap-6">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#1b1b1b]/60">
              Welcome back
            </p>
            <h1 className="text-4xl font-semibold leading-tight tracking-tight font-[var(--font-display)]">
              Pick up your streak.
            </h1>
            <p className="max-w-md text-sm text-[#1b1b1b]/70">
              Log in to continue your adaptive training plan and keep your Elo
              momentum steady.
            </p>
            <div className="flex items-center gap-3 text-sm">
              <span className="rounded-full border border-[#1b1b1b]/10 bg-white/70 px-3 py-1">
                Daily streaks
              </span>
              <span className="rounded-full border border-[#1b1b1b]/10 bg-white/70 px-3 py-1">
                Session history
              </span>
            </div>
          </section>

          <section className="rounded-3xl border border-[#1b1b1b]/10 bg-white/80 p-8 shadow-[0_30px_80px_rgba(27,27,27,0.12)]">
            <form className="flex flex-col gap-5">
              <div>
                <label className="text-xs font-semibold uppercase tracking-[0.22em] text-[#1b1b1b]/60">
                  Email
                </label>
                <input
                  className="mt-2 w-full rounded-2xl border border-[#1b1b1b]/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#1b1b1b]/40"
                  name="email"
                  type="email"
                  placeholder="jordan@samolni.app"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-[0.22em] text-[#1b1b1b]/60">
                  Password
                </label>
                <input
                  className="mt-2 w-full rounded-2xl border border-[#1b1b1b]/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#1b1b1b]/40"
                  name="password"
                  type="password"
                  placeholder="Your password"
                />
              </div>
              <button
                className="mt-2 inline-flex items-center justify-center rounded-full bg-[#1b1b1b] px-6 py-3 text-sm font-semibold text-white transition hover:bg-black"
                type="submit"
              >
                Log in
              </button>
            </form>
            <div className="mt-6 text-sm text-[#1b1b1b]/70">
              New here?{" "}
              <Link className="font-semibold text-[#1b1b1b]" href="/signup">
                Create an account
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
