import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DOMAIN_LABEL, DOMAIN_SYMBOL } from "@/features/training/domain-config";
import { getUserDomainLevels } from "@/features/training/domain-progress";
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

  const cookieStore = await cookies();
  const savedSettings = (() => {
    try {
      const raw = cookieStore.get("training-settings")?.value;
      if (raw) return JSON.parse(raw) as { operations: string[]; count: string };
    } catch { }
    return null;
  })();
  const savedOperations = savedSettings?.operations ?? ["addition", "subtraction", "multiplication", "division"];
  const savedCount = savedSettings?.count ?? "10";

  const levels = await getUserDomainLevels(session.user.id);

  return (
    <div className="mx-auto w-full max-w-6xl px-6 pb-16 sm:px-10">
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
                    className="group relative flex w-full cursor-pointer items-center justify-between rounded-2xl border border-[#151515]/10 bg-white p-3 text-sm transition hover:border-[#151515]/30 has-[:checked]:border-[#151515] has-[:checked]:bg-[#f8f3ea]"
                  >
                    <input
                      id={`op-${operation.id}`}
                      type="checkbox"
                      name="operations"
                      value={operation.id}
                      defaultChecked={savedOperations.includes(operation.id)}
                      className="sr-only"
                    />
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#151515]/5 text-lg font-bold text-[#151515] transition group-has-[:checked]:bg-white group-has-[:checked]:shadow-sm">
                        {operation.symbol}
                      </div>
                      <span className="font-semibold text-[#151515]/85 group-has-[:checked]:text-[#151515]">{operation.label}</span>
                    </div>
                    <div className="mr-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-[#151515]/20 bg-transparent text-transparent transition-colors group-has-[:checked]:border-[#151515] group-has-[:checked]:bg-[#151515] group-has-[:checked]:text-white sm:mr-1">
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
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
              Levels
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
  );
}