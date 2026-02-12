import Link from "next/link";
import { redirect } from "next/navigation";

import { getServerSession } from "@/lib/session";

type TrendPoint = {
  day: string;
  sessions: number;
};

type HeatmapCell = {
  dateKey: string;
  intensity: 0 | 1 | 2 | 3 | 4;
};

type OperationOption = {
  id: string;
  label: string;
  symbol: string;
  defaultChecked?: boolean;
};

const mockStreak = {
  current: 12,
  longest: 21,
  trainedThisWeek: 5,
};

const mockTrend: TrendPoint[] = [
  { day: "Mon", sessions: 2 },
  { day: "Tue", sessions: 3 },
  { day: "Wed", sessions: 1 },
  { day: "Thu", sessions: 4 },
  { day: "Fri", sessions: 3 },
  { day: "Sat", sessions: 5 },
  { day: "Sun", sessions: 2 },
];

const weekdayLabels = ["Mon", "Wed", "Fri", "Sun"];

const intensityClasses = [
  "bg-[#151515]/5",
  "bg-[#151515]/15",
  "bg-[#151515]/30",
  "bg-[#151515]/50",
  "bg-[#151515]/75",
];

const operationOptions: OperationOption[] = [
  { id: "addition", label: "Addition", symbol: "+", defaultChecked: true },
  { id: "subtraction", label: "Subtraction", symbol: "−", defaultChecked: true },
  { id: "multiplication", label: "Multiplication", symbol: "×", defaultChecked: true },
  { id: "division", label: "Division", symbol: "÷", defaultChecked: true },
  { id: "powers", label: "Powers", symbol: "a^b" },
  { id: "square-root", label: "Square roots", symbol: "√x" },
  { id: "nth-root", label: "Nth roots", symbol: "ⁿ√x" },
];

const generateHeatmap = (): HeatmapCell[][] => {
  const totalDays = 84;
  const cells = Array.from({ length: totalDays }, (_, index) => {
    const cycle = (index * 7 + 3) % 10;
    const intensity = (cycle > 7 ? 0 : ((cycle % 5) as 0 | 1 | 2 | 3 | 4));

    return {
      dateKey: `mock-day-${index + 1}`,
      intensity,
    };
  });

  return Array.from({ length: 12 }, (_, weekIndex) =>
    cells.slice(weekIndex * 7, weekIndex * 7 + 7)
  );
};

export default async function DashboardPage() {
  const session = await getServerSession();

  if (!session) {
    redirect("/");
  }

  const peakSessions = Math.max(...mockTrend.map((item) => item.sessions));
  const heatmapWeeks = generateHeatmap();

  return (
    <div className="min-h-screen bg-[#f8f3ea] text-[#151515]">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 pb-16 pt-8 sm:px-10">
        <header className="flex items-center justify-between">
          <Link className="flex items-center" href="/">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-[#151515] text-xs font-bold text-white">
              S
            </span>
          </Link>
          <span className="rounded-full border border-[#151515]/20 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-[#151515]/70">
            Mock dashboard
          </span>
        </header>

        <main className="mt-10 grid gap-6 lg:grid-cols-[1.05fr_1fr]">
          <section className="rounded-3xl border border-[#151515]/10 bg-white/80 p-7">
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="rounded-2xl border border-[#151515]/10 bg-[#f8f3ea] px-3 py-2">
                <p className="uppercase tracking-[0.16em] text-[#151515]/55">Streak</p>
                <p className="mt-1 text-lg font-semibold">{mockStreak.current}d</p>
              </div>
              <div className="rounded-2xl border border-[#151515]/10 bg-[#f8f3ea] px-3 py-2">
                <p className="uppercase tracking-[0.16em] text-[#151515]/55">Longest</p>
                <p className="mt-1 text-lg font-semibold">{mockStreak.longest}d</p>
              </div>
              <div className="rounded-2xl border border-[#151515]/10 bg-[#f8f3ea] px-3 py-2">
                <p className="uppercase tracking-[0.16em] text-[#151515]/55">Week</p>
                <p className="mt-1 text-lg font-semibold">{mockStreak.trainedThisWeek}</p>
              </div>
            </div>

            <h2 className="mt-7 text-2xl font-semibold font-[var(--font-display)]">Start training</h2>
            <p className="mt-2 text-sm text-[#151515]/65">
              Pick a focus and difficulty. This is prototype-only and still starts the current training flow.
            </p>

            <form action="/training" className="mt-6 space-y-4">
              <fieldset>
                <legend className="text-xs font-semibold uppercase tracking-[0.2em] text-[#151515]/55">
                  What to train
                </legend>
                <div className="mt-2 grid grid-cols-2 gap-2">
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
                      <span className="flex w-full items-center justify-between rounded-2xl border border-[#151515]/15 bg-white px-3 py-3 text-sm transition hover:border-[#151515]/40 peer-checked:border-[#151515]/45 peer-checked:bg-[#151515]/10">
                        <span className="font-semibold text-[#151515]/80">{operation.label}</span>
                        <span className="text-xs font-semibold text-[#151515]/60">{operation.symbol}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <div>
                <label
                  className="text-xs font-semibold uppercase tracking-[0.2em] text-[#151515]/55"
                  htmlFor="training-difficulty"
                >
                  Difficulty
                </label>
                <select
                  id="training-difficulty"
                  name="difficulty"
                  defaultValue="adaptive"
                  className="mt-2 w-full rounded-2xl border border-[#151515]/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#151515]/35"
                >
                  <option value="easy">Easy</option>
                  <option value="adaptive">Optimal</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <button
                type="submit"
                className="inline-flex w-full items-center justify-center rounded-full bg-[#151515] px-6 py-3 text-sm font-semibold text-white transition hover:bg-black"
              >
                Start training
              </button>
            </form>
          </section>

          <section className="rounded-3xl border border-[#151515]/10 bg-white/80 p-7">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#151515]/55">
                  Session trend
                </p>
                <h2 className="mt-3 text-2xl font-semibold font-[var(--font-display)]">
                  Last 7 days
                </h2>
              </div>
              <p className="text-sm text-[#151515]/60">Sessions / day</p>
            </div>

            <div className="mt-8 flex h-52 items-end gap-3">
              {mockTrend.map((point) => {
                const heightPercent = Math.max(
                  16,
                  Math.round((point.sessions / peakSessions) * 100)
                );

                return (
                  <div key={point.day} className="flex flex-1 flex-col items-center gap-2">
                    <div className="w-full rounded-t-2xl border border-[#151515]/10 bg-[#151515]/85" style={{ height: `${heightPercent}%` }} />
                    <span className="text-xs font-semibold text-[#151515]/60">{point.day}</span>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="rounded-3xl border border-[#151515]/10 bg-white/80 p-7 lg:col-span-2">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#151515]/55">
                  Training heatmap
                </p>
                <h3 className="mt-3 text-2xl font-semibold font-[var(--font-display)]">
                  Last 12 weeks
                </h3>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#151515]/55">
                <span>Less</span>
                {intensityClasses.map((shade) => (
                  <span
                    key={shade}
                    className={`h-3 w-3 rounded-sm border border-[#151515]/10 ${shade}`}
                  />
                ))}
                <span>More</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-[auto_1fr] gap-3">
              <div className="grid grid-rows-7 gap-1.5 pt-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#151515]/45">
                {["Mon", "", "Wed", "", "Fri", "", "Sun"].map((label, index) => (
                  <span key={`label-${index}`} className="h-4 leading-4">
                    {label}
                  </span>
                ))}
              </div>

              <div className="overflow-x-auto pb-1">
                <div className="inline-grid grid-flow-col gap-1.5">
                  {heatmapWeeks.map((week, weekIndex) => (
                    <div key={`week-${weekIndex}`} className="grid grid-rows-7 gap-1.5">
                      {week.map((cell) => (
                        <span
                          key={cell.dateKey}
                          className={`h-4 w-4 rounded-[4px] border border-[#151515]/10 ${intensityClasses[cell.intensity]}`}
                          title={cell.intensity === 0 ? "No session" : `${cell.intensity} session${cell.intensity > 1 ? "s" : ""}`}
                        />
                      ))}
                    </div>
                  ))}
                </div>
                <div className="mt-3 grid grid-cols-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#151515]/45">
                  {weekdayLabels.map((label) => (
                    <span key={label}>{label}</span>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}