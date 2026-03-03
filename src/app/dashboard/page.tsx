import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

import { AccountMenu } from "@/components/account-menu";
import { BrandMark } from "@/components/brand-mark";
import { DOMAIN_LABEL, DOMAIN_SYMBOL } from "@/features/training/domain-config";
import { getUserDomainLevels } from "@/features/training/domain-progress";
import { isAnonymousUser } from "@/lib/auth-helpers";
import { getServerSession } from "@/lib/session";
import { startTraining } from "./actions";

type OperationOption = {
  id: string;
  label: string;
  symbol: string;
  defaultChecked?: boolean;
};

const operationOptions: OperationOption[] = [
  { id: "addition", label: "Addition", symbol: "+", defaultChecked: true },
  { id: "subtraction", label: "Subtraction", symbol: "−", defaultChecked: true },
  { id: "multiplication", label: "Multiplication", symbol: "×", defaultChecked: true },
  { id: "division", label: "Division", symbol: "÷", defaultChecked: true },
];

export default async function DashboardPage() {
  const session = await getServerSession();

  if (!session) {
    redirect("/");
  }

  const isAnonymous = isAnonymousUser(session.user);

  const cookieStore = await cookies();
  const savedSettings = (() => {
    try {
      const raw = cookieStore.get("training-settings")?.value;
      if (raw) return JSON.parse(raw) as { operations: string[]; count: string };
    } catch {}
    return null;
  })();
  const savedOperations = savedSettings?.operations ?? ["addition", "subtraction", "multiplication", "division"];
  const savedCount = savedSettings?.count ?? "10";

  const levels = await getUserDomainLevels(session.user.id);

  return (
    <div className="min-h-screen bg-[#f8f3ea] text-[#151515]">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 pb-16 pt-8 sm:px-10">
        <header className="flex items-center justify-between">
          <Link className="flex items-center" href="/">
            <BrandMark />
          </Link>
          {isAnonymous ? (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-full border border-[#151515]/15 px-4 py-2 text-sm font-semibold text-[#151515] transition hover:border-[#151515]/35"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center justify-center rounded-full bg-[#151515] px-4 py-2 text-sm font-semibold text-white transition hover:bg-black"
              >
                Sign up
              </Link>
            </div>
          ) : (
            <AccountMenu />
          )}
        </header>

        <main className="mt-10 space-y-6">
          <section className="rounded-3xl border border-[#151515]/10 bg-white p-7 sm:p-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#151515]/55">
                Training setup
              </p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight font-display sm:text-3xl">
                Choose operations
              </h1>
            </div>

              <form action={startTraining} className="mt-6 space-y-5">
              <fieldset>
                <legend className="text-xs font-semibold uppercase tracking-[0.2em] text-[#151515]/55">
                  Operations
                </legend>
                <div className="mt-3 grid grid-cols-2 gap-2 lg:grid-cols-4">
                  {operationOptions.map((operation) => (
                    <label
                      key={operation.id}
                      htmlFor={`op-${operation.id}`}
                      className="group cursor-pointer"
                    >
                      <input
                        id={`op-${operation.id}`}
                        type="checkbox"
                        name="operations"
                        value={operation.id}
                        defaultChecked={savedOperations.includes(operation.id)}
                        className="peer sr-only"
                      />
                      <span className="flex w-full items-center justify-between rounded-2xl border border-[#151515]/15 bg-[#151515]/8 px-3 py-3 text-sm opacity-40 transition hover:opacity-70 peer-checked:bg-[#f8f3ea] peer-checked:opacity-100">
                        <span className="font-semibold text-[#151515]/85">{operation.label}</span>
                        <span className="text-xs font-semibold text-[#151515]/65">{operation.symbol}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <label
                    htmlFor="calculation-count"
                    className="text-xs font-semibold uppercase tracking-[0.2em] text-[#151515]/55"
                  >
                    Number of calculations
                  </label>
                  <select
                    id="calculation-count"
                    name="count"
                    defaultValue={savedCount}
                    className="mt-2 block rounded-2xl border border-[#151515]/15 bg-[#f8f3ea] px-4 py-3 text-sm font-medium outline-none transition focus:border-[#151515]/35"
                  >
                    <option value="5">5</option>
                    <option value="10">10</option>
                    <option value="15">15</option>
                    <option value="20">20</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-full bg-[#151515] px-6 py-3 text-sm font-semibold text-white transition hover:bg-black"
                >
                  Start training
                </button>
              </div>
            </form>
          </section>

          <section className="rounded-3xl border border-[#151515]/10 bg-white p-7 sm:p-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#151515]/55">
                Domain levels
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {levels.map((entry) => (
                  <div
                    key={entry.domain}
                    className="rounded-2xl border border-[#151515]/10 bg-[#f8f3ea] p-3"
                  >
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#151515]/55">
                      {DOMAIN_SYMBOL[entry.domain]} {DOMAIN_LABEL[entry.domain]}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-[#151515]/85">
                      Lv {entry.currentLevel}
                    </p>
                    <p className="text-[11px] text-[#151515]/55">
                      Highest {entry.highestUnlockedLevel}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}