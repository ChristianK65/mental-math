import Link from "next/link";
import { redirect } from "next/navigation";

import { Domain } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/session";

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

const orderedDomains: Domain[] = [Domain.ADD, Domain.SUB, Domain.MUL, Domain.DIV];

const domainLabel: Record<Domain, string> = {
  ADD: "Addition",
  SUB: "Subtraction",
  MUL: "Multiplication",
  DIV: "Division",
};

const domainSymbol: Record<Domain, string> = {
  ADD: "+",
  SUB: "−",
  MUL: "×",
  DIV: "÷",
};

export default async function DashboardPage() {
  const session = await getServerSession();

  if (!session) {
    redirect("/");
  }

  const progressRows = await prisma.userDomainProgress.findMany({
    where: {
      userId: session.user.id,
      domain: {
        in: orderedDomains,
      },
    },
    select: {
      domain: true,
      currentLevel: true,
      highestUnlockedLevel: true,
    },
  });
  const progressByDomain = new Map(progressRows.map((row) => [row.domain, row]));
  const levels = orderedDomains.map((domain) => {
    const row = progressByDomain.get(domain);

    return {
      domain,
      currentLevel: row?.currentLevel ?? 1,
      highestUnlockedLevel: row?.highestUnlockedLevel ?? 1,
    };
  });

  return (
    <div className="min-h-screen bg-[#f8f3ea] text-[#151515]">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 pb-16 pt-8 sm:px-10">
        <header className="flex items-center">
          <Link className="flex items-center" href="/">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-[#151515] text-xs font-bold text-white">
              S
            </span>
          </Link>
        </header>

        <main className="mt-10 space-y-6">
          <section className="rounded-3xl border border-[#151515]/10 bg-white p-7 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#151515]/55">
                  Training setup
                </p>
                <h1 className="mt-2 text-2xl font-semibold tracking-tight font-[var(--font-display)] sm:text-3xl">
                  Choose operations
                </h1>
              </div>
              <span className="rounded-full border border-[#151515]/15 bg-[#f8f3ea] px-3 py-1 text-xs font-semibold text-[#151515]/70">
                4 core domains
              </span>
            </div>

            <form action="/training" className="mt-6 space-y-5">
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
                        defaultChecked={operation.defaultChecked}
                        className="peer sr-only"
                      />
                      <span className="flex w-full items-center justify-between rounded-2xl border border-[#151515]/15 bg-[#f8f3ea] px-3 py-3 text-sm transition hover:border-[#151515]/40 peer-checked:border-[#151515]/45 peer-checked:bg-[#151515]/10">
                        <span className="font-semibold text-[#151515]/85">{operation.label}</span>
                        <span className="text-xs font-semibold text-[#151515]/65">{operation.symbol}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <div className="max-w-xs">
                <label
                  htmlFor="calculation-count"
                  className="text-xs font-semibold uppercase tracking-[0.2em] text-[#151515]/55"
                >
                  Number of calculations
                </label>
                <select
                  id="calculation-count"
                  name="count"
                  defaultValue="10"
                  className="mt-2 w-full rounded-2xl border border-[#151515]/15 bg-[#f8f3ea] px-4 py-3 text-sm font-medium outline-none transition focus:border-[#151515]/35"
                >
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="15">15</option>
                  <option value="20">20</option>
                </select>
              </div>

              <button
                type="submit"
                className="inline-flex w-full items-center justify-center rounded-full bg-[#151515] px-6 py-3 text-sm font-semibold text-white transition hover:bg-black sm:w-auto sm:min-w-[220px]"
              >
                Start training
              </button>
            </form>
          </section>

          <section className="rounded-3xl border border-[#151515]/10 bg-white p-7 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#151515]/55">
              Progress snapshot
            </p>
            <div className="mt-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#151515]/55">
                Domain levels
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {levels.map((entry) => (
                  <div
                    key={entry.domain}
                    className="rounded-2xl border border-[#151515]/10 bg-[#f8f3ea] px-3 py-3"
                  >
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#151515]/55">
                      {domainSymbol[entry.domain]} {domainLabel[entry.domain]}
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