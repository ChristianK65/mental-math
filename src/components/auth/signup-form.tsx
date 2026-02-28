"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { authClient } from "@/lib/auth-client";

export function SignUpForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [usernameStatus, setUsernameStatus] = useState<
    "idle" | "checking" | "available" | "unavailable"
  >("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const trimmedUsername = username.trim();

    if (trimmedUsername.length < 3) {
      return;
    }

    let isActive = true;
    const timeoutId = setTimeout(async () => {
      const { data, error } = await authClient.isUsernameAvailable({
        username: trimmedUsername,
      });

      if (!isActive) {
        return;
      }

      if (error) {
        setUsernameStatus("idle");
        return;
      }

      setUsernameStatus(data?.available ? "available" : "unavailable");
    }, 350);

    return () => {
      isActive = false;
      clearTimeout(timeoutId);
    };
  }, [username]);

  const handleSubmit = async (
    event: React.SyntheticEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    const trimmedUsername = username.trim();

    if (usernameStatus === "unavailable") {
      setErrorMessage("That username is already taken.");
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    const { data: availabilityData, error: availabilityError } =
      await authClient.isUsernameAvailable({
        username: trimmedUsername,
      });

    if (availabilityError || !availabilityData?.available) {
      setIsSubmitting(false);
      setUsernameStatus("unavailable");
      setErrorMessage("That username is already taken.");
      return;
    }

    const { error } = await authClient.signUp.email({
      name: trimmedUsername,
      email,
      password,
      username: trimmedUsername,
      callbackURL: "/dashboard",
    });

    setIsSubmitting(false);

    if (error) {
      setErrorMessage(error.message ?? "Signup failed.");
      return;
    }

    router.push("/dashboard");
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f6f1ea] text-[#1b1b1b]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,201,120,0.35),transparent_40%),radial-gradient(circle_at_80%_30%,rgba(120,205,255,0.32),transparent_45%)]" />
      <div className="relative mx-auto flex min-h-screen w-full max-w-5xl flex-col justify-center px-6 py-16 sm:px-10">
        <div className="grid gap-10 lg:grid-cols-[1fr_0.9fr]">
          <section className="flex flex-col justify-center gap-6">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#1b1b1b]/60">
              Create account
            </p>
            <h1 className="text-4xl font-semibold leading-tight tracking-tight font-[var(--font-display)]">
              Start your Samolni streak.
            </h1>
            <p className="max-w-md text-sm text-[#1b1b1b]/70">
              Create a profile and get your first Elo rating in minutes. You can
              switch between skill tracks anytime.
            </p>
            <div className="flex items-center gap-3 text-sm">
              <span className="rounded-full border border-[#1b1b1b]/10 bg-white/70 px-3 py-1">
                Elo-based training
              </span>
              <span className="rounded-full border border-[#1b1b1b]/10 bg-white/70 px-3 py-1">
                5 minute sessions
              </span>
            </div>
          </section>

          <section className="rounded-3xl border border-[#1b1b1b]/10 bg-white/80 p-8 shadow-[0_30px_80px_rgba(27,27,27,0.12)]">
            <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
              <div>
                <label className="text-xs font-semibold uppercase tracking-[0.22em] text-[#1b1b1b]/60">
                  Username
                </label>
                <input
                  className="mt-2 w-full rounded-2xl border border-[#1b1b1b]/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#1b1b1b]/40"
                  name="username"
                  type="text"
                  value={username}
                  onChange={(event) => {
                    const nextUsername = event.target.value;
                    setUsername(nextUsername);
                    setErrorMessage(null);
                    setUsernameStatus(
                      nextUsername.trim().length < 3 ? "idle" : "checking"
                    );
                  }}
                  placeholder="jordan"
                  autoComplete="username"
                  minLength={3}
                  required
                />
                {usernameStatus === "checking" ? (
                  <p className="mt-2 text-xs text-[#1b1b1b]/60">
                    Checking username availability...
                  </p>
                ) : null}
                {usernameStatus === "available" ? (
                  <p className="mt-2 text-xs text-green-700">
                    Username is available.
                  </p>
                ) : null}
                {usernameStatus === "unavailable" ? (
                  <p className="mt-2 text-xs text-red-700">
                    Username is not available.
                  </p>
                ) : null}
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-[0.22em] text-[#1b1b1b]/60">
                  Email
                </label>
                <input
                  className="mt-2 w-full rounded-2xl border border-[#1b1b1b]/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#1b1b1b]/40"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="jordan@samolni.app"
                  autoComplete="email"
                  required
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
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                  required
                />
              </div>
              {errorMessage ? (
                <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">
                  {errorMessage}
                </p>
              ) : null}
              <button
                className="mt-2 inline-flex items-center justify-center rounded-full bg-[#1b1b1b] px-6 py-3 text-sm font-semibold text-white transition hover:bg-black"
                type="submit"
                disabled={isSubmitting || usernameStatus === "checking"}
              >
                {isSubmitting ? "Creating..." : "Create account"}
              </button>
            </form>
            <div className="mt-6 text-sm text-[#1b1b1b]/70">
              Already have an account?{" "}
              <Link className="font-semibold text-[#1b1b1b]" href="/login">
                Log in
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}