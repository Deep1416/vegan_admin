"use client";

import { Plus, Trash2 } from "lucide-react";
import type { AdminGymPlanRow } from "@/lib/gym-plan-rows";
import { emptyGymPlanRow } from "@/lib/gym-plan-rows";

const inpt =
  "min-w-0 rounded border border-slate-700 bg-slate-950 px-2 py-1.5 text-xs text-white outline-none focus:border-accent";

type Props = {
  rows: AdminGymPlanRow[];
  onChangeRows: (next: AdminGymPlanRow[]) => void;
  onSavePost: () => void | Promise<void>;
  saving: boolean;
  disabled?: boolean;
};

export function AdminGymPlanRowsTable({ rows, onChangeRows, onSavePost, saving, disabled }: Props) {
  function patchRow(index: number, patch: Partial<AdminGymPlanRow>) {
    onChangeRows(rows.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  }

  function addRow() {
    onChangeRows([...rows, emptyGymPlanRow()]);
  }

  function removeRow(index: number) {
    onChangeRows(rows.length <= 1 ? [emptyGymPlanRow()] : rows.filter((_, i) => i !== index));
  }

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 md:p-6">
      <p className="text-xs font-semibold uppercase tracking-wide text-accent">POST · quick grid</p>
      <h2 className="mt-1 text-xl font-semibold text-white">Day / title / exercise rows</h2>
      <p className="mt-2 max-w-3xl text-sm text-slate-400">
        One row per exercise. Repeat <span className="text-slate-300">Day</span> and <span className="text-slate-300">Title</span> on
        each line, or leave them blank on follow-on rows to inherit the row above. Submitting calls{" "}
        <code className="rounded bg-slate-950 px-1 text-slate-300">POST /api/admin/users/:id/gym-plan</code> and updates the
        member&apos;s live plan — the main app already loads this on the gym page.
      </p>

      <div className="mt-5 overflow-x-auto rounded-lg border border-slate-800">
        <table className="w-full min-w-[980px] text-left text-xs">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900/90 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              <th className="px-2 py-2 font-medium">Day</th>
              <th className="px-2 py-2 font-medium">Title</th>
              <th className="px-2 py-2 font-medium">Exercise</th>
              <th className="w-14 px-2 py-2 font-medium">Sets</th>
              <th className="w-16 px-2 py-2 font-medium">Reps</th>
              <th className="px-2 py-2 font-medium">Load</th>
              <th className="w-16 px-2 py-2 font-medium">Rest</th>
              <th className="min-w-[120px] px-2 py-2 font-medium">Form cues</th>
              <th className="w-10 px-1 py-2" />
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-b border-slate-800/80 last:border-0">
                <td className="p-1 align-top">
                  <input
                    className={`${inpt} w-full min-w-[88px]`}
                    placeholder="Monday"
                    value={row.day}
                    onChange={(e) => patchRow(i, { day: e.target.value })}
                  />
                </td>
                <td className="p-1 align-top">
                  <input
                    className={`${inpt} w-full min-w-[88px]`}
                    placeholder="Upper"
                    value={row.title}
                    onChange={(e) => patchRow(i, { title: e.target.value })}
                  />
                </td>
                <td className="p-1 align-top">
                  <input
                    className={`${inpt} w-full min-w-[100px]`}
                    placeholder="Bench press"
                    value={row.exercise}
                    onChange={(e) => patchRow(i, { exercise: e.target.value })}
                  />
                </td>
                <td className="p-1 align-top">
                  <input
                    className={`${inpt} w-full`}
                    placeholder="4"
                    value={row.sets}
                    onChange={(e) => patchRow(i, { sets: e.target.value })}
                  />
                </td>
                <td className="p-1 align-top">
                  <input
                    className={`${inpt} w-full`}
                    placeholder="8"
                    value={row.reps}
                    onChange={(e) => patchRow(i, { reps: e.target.value })}
                  />
                </td>
                <td className="p-1 align-top">
                  <input
                    className={`${inpt} w-full min-w-[72px]`}
                    placeholder="kg / %"
                    value={row.load}
                    onChange={(e) => patchRow(i, { load: e.target.value })}
                  />
                </td>
                <td className="p-1 align-top">
                  <input
                    className={`${inpt} w-full`}
                    placeholder="90s"
                    value={row.rest}
                    onChange={(e) => patchRow(i, { rest: e.target.value })}
                  />
                </td>
                <td className="p-1 align-top">
                  <textarea
                    className={`${inpt} min-h-[52px] w-full resize-y`}
                    placeholder="Cues…"
                    value={row.formCues}
                    onChange={(e) => patchRow(i, { formCues: e.target.value })}
                    rows={2}
                  />
                </td>
                <td className="p-1 align-top">
                  <button
                    type="button"
                    className="rounded p-1.5 text-slate-500 hover:bg-slate-800 hover:text-red-300"
                    onClick={() => removeRow(i)}
                    aria-label="Remove row"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          className={`${inpt} inline-flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm`}
          onClick={addRow}
        >
          <Plus className="h-4 w-4" />
          Add row
        </button>
        <button
          type="button"
          disabled={disabled || saving}
          onClick={() => void onSavePost()}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-accent-muted disabled:cursor-not-allowed disabled:opacity-40"
        >
          {saving ? "Saving…" : "POST — save from grid"}
        </button>
      </div>
    </section>
  );
}
