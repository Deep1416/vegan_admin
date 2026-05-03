"use client";

import type { GymSession } from "@/lib/gym-plan-types";

const WEEKDAY_FULL = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

function sessionWeekdayIndex(label: string) {
  const day = label.toLowerCase();
  if (day.includes("sun")) return 0;
  if (day.includes("mon")) return 1;
  if (day.includes("tue")) return 2;
  if (day.includes("wed")) return 3;
  if (day.includes("thu")) return 4;
  if (day.includes("fri")) return 5;
  if (day.includes("sat")) return 6;
  if (day.includes("day 1") || day.includes("day a")) return 1;
  if (day.includes("day 2")) return 2;
  if (day.includes("day 3")) return 3;
  if (day.includes("day 4")) return 4;
  if (day.includes("day 5")) return 5;
  if (day.includes("day 6")) return 6;
  return 0;
}

function resolvePlannerWeekday(session: GymSession) {
  if (
    typeof session.preferredWeekday === "number" &&
    session.preferredWeekday >= 0 &&
    session.preferredWeekday <= 6
  ) {
    return session.preferredWeekday;
  }
  return sessionWeekdayIndex(session.day);
}

function sessionTitle(s: GymSession) {
  const t = s.title?.trim();
  if (t) return t;
  return s.focus?.trim() || "Training";
}

function sessionSubtitle(s: GymSession) {
  const sub = s.subtitle?.trim();
  if (sub) return sub;
  return s.objective?.trim() || "";
}

export function AdminGymWeekPreview({ sessions }: { sessions: GymSession[] }) {
  const withIdx = sessions.map((s) => ({ ...s, weekdayIndex: resolvePlannerWeekday(s) }));
  const byDay = new Map<number, GymSession>();
  for (const s of withIdx) {
    const hasWork = s.exercises.some((e) => e.name?.trim());
    if (!hasWork) continue;
    if (!byDay.has(s.weekdayIndex)) byDay.set(s.weekdayIndex, s);
  }
  const indices = Array.from(byDay.keys()).sort((a, b) => a - b);

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/30 p-5 md:p-6">
      <p className="text-xs font-semibold uppercase tracking-wide text-accent">Read-only preview</p>
      <h2 className="mt-1 text-xl font-semibold text-white">Member app · programmed days</h2>
      <p className="mt-1 text-sm text-slate-400">
        Only weekdays with a session block are shown in the app (empty weekdays are omitted).
      </p>

      {indices.length === 0 ? (
        <p className="mt-6 rounded-lg border border-dashed border-slate-700 px-4 py-8 text-center text-sm text-slate-500">
          No sessions yet — add rows or sessions, then save.
        </p>
      ) : (
        <div className="mt-6 space-y-4">
          {indices.map((weekdayIndex) => {
            const session = byDay.get(weekdayIndex)!;
            const title = sessionTitle(session);
            const subtitle = sessionSubtitle(session);

            return (
              <div
                key={weekdayIndex}
                className="rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-4 md:px-5"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {WEEKDAY_FULL[weekdayIndex]}
                  </span>
                  {session.day?.trim() ? <span className="text-xs text-slate-500">{session.day}</span> : null}
                </div>
                <h3 className="mt-1 text-lg font-semibold text-white">{title}</h3>
                {subtitle ? <p className="mt-1 text-sm text-slate-400">{subtitle}</p> : null}

                <div className="mt-3 overflow-x-auto rounded-lg border border-slate-800">
                  <table className="w-full min-w-[640px] text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-800 text-xs uppercase text-slate-500">
                        <th className="px-3 py-2 font-medium">Exercise</th>
                        <th className="px-3 py-2 font-medium">Sets</th>
                        <th className="px-3 py-2 font-medium">Reps</th>
                        <th className="px-3 py-2 font-medium">Load</th>
                        <th className="px-3 py-2 font-medium">Rest</th>
                        <th className="min-w-[200px] px-3 py-2 font-medium">Form cues</th>
                      </tr>
                    </thead>
                    <tbody>
                      {session.exercises.map((ex, ei) => (
                        <tr key={ei} className="border-b border-slate-800/80 last:border-0">
                          <td className="px-3 py-2 text-slate-200">
                            <span className="font-medium">{ex.name}</span>
                            {ex.note?.trim() ? (
                              <span className="mt-0.5 block text-xs text-accent">{ex.note}</span>
                            ) : null}
                          </td>
                          <td className="px-3 py-2 text-slate-400">{ex.sets}</td>
                          <td className="px-3 py-2 text-slate-400">{ex.reps}</td>
                          <td className="px-3 py-2 text-slate-400">{ex.load}</td>
                          <td className="px-3 py-2 text-slate-400">{ex.rest}</td>
                          <td className="px-3 py-2 text-xs leading-relaxed text-slate-400">
                            {ex.formCues?.trim() || "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
