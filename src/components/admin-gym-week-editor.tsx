"use client";

import { Plus, Trash2 } from "lucide-react";
import type { GymExercise, GymSession } from "@/lib/gym-plan-types";
import { emptySession } from "@/lib/gym-plan-types";

const inpt =
  "w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-accent";
const btnSecondary =
  "inline-flex items-center gap-2 rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700";

type Props = {
  sessions: GymSession[];
  onChange: (next: GymSession[]) => void;
  title?: string;
  description?: string;
};

const emptyExercise = (): GymExercise => ({
  name: "",
  sets: "",
  reps: "",
  load: "",
  rest: "",
  note: "",
  formCues: ""
});

export function AdminGymWeekEditor({ sessions, onChange, title, description }: Props) {
  function patchSession(index: number, patch: Partial<GymSession>) {
    onChange(sessions.map((s, i) => (i === index ? { ...s, ...patch } : s)));
  }

  function patchExercise(sessionIndex: number, exerciseIndex: number, patch: Partial<GymExercise>) {
    onChange(
      sessions.map((s, si) => {
        if (si !== sessionIndex) return s;
        const exercises = s.exercises.map((ex, ei) => (ei === exerciseIndex ? { ...ex, ...patch } : ex));
        return { ...s, exercises };
      })
    );
  }

  function addExercise(sessionIndex: number) {
    onChange(
      sessions.map((s, si) =>
        si === sessionIndex ? { ...s, exercises: [...s.exercises, emptyExercise()] } : s
      )
    );
  }

  function removeExercise(sessionIndex: number, exerciseIndex: number) {
    onChange(
      sessions.map((s, si) => {
        if (si !== sessionIndex) return s;
        const exercises = s.exercises.filter((_, ei) => ei !== exerciseIndex);
        return { ...s, exercises: exercises.length ? exercises : [emptyExercise()] };
      })
    );
  }

  function addSession() {
    onChange([...sessions, emptySession()]);
  }

  function removeSession(sessionIndex: number) {
    onChange(sessions.filter((_, i) => i !== sessionIndex));
  }

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 md:p-6">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-accent">Structured edit</p>
          <h2 className="mt-1 text-xl font-semibold text-white">{title ?? "Gym week (editable)"}</h2>
          <p className="mt-2 max-w-3xl text-sm text-slate-400">
            {description ??
              "Sessions sync to the member app after save. Map each block to a weekday with Train on when possible."}
          </p>
        </div>
        <button type="button" className={btnSecondary} onClick={addSession}>
          <Plus className="h-4 w-4" aria-hidden />
          Add gym day
        </button>
      </div>

      {sessions.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-600 px-4 py-10 text-center text-sm text-slate-500">
          No sessions. Add a gym day or paste valid JSON from export tools.
        </div>
      ) : (
        <div className="space-y-6">
          {sessions.map((session, si) => (
            <div key={si} className="rounded-xl border border-slate-800 bg-slate-950/50 p-4 md:p-5">
              <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                <div className="grid flex-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-500">Day label</label>
                    <input
                      className={inpt}
                      value={session.day}
                      onChange={(e) => patchSession(si, { day: e.target.value })}
                      placeholder="e.g. Monday · Upper"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-500">Train on</label>
                    <select
                      className={inpt}
                      value={
                        typeof session.preferredWeekday === "number" ? String(session.preferredWeekday) : ""
                      }
                      onChange={(e) => {
                        const v = e.target.value;
                        patchSession(si, { preferredWeekday: v === "" ? null : Number(v) });
                      }}
                    >
                      <option value="">Auto from label</option>
                      <option value="0">Sunday</option>
                      <option value="1">Monday</option>
                      <option value="2">Tuesday</option>
                      <option value="3">Wednesday</option>
                      <option value="4">Thursday</option>
                      <option value="5">Friday</option>
                      <option value="6">Saturday</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-500">Title override</label>
                    <input
                      className={inpt}
                      value={session.title ?? ""}
                      onChange={(e) => patchSession(si, { title: e.target.value })}
                      placeholder="Optional · else Focus"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-500">Subtitle override</label>
                    <input
                      className={inpt}
                      value={session.subtitle ?? ""}
                      onChange={(e) => patchSession(si, { subtitle: e.target.value })}
                      placeholder="Optional · else Objective"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-500">Focus</label>
                    <input
                      className={inpt}
                      value={session.focus}
                      onChange={(e) => patchSession(si, { focus: e.target.value })}
                      placeholder="Push / pull…"
                    />
                  </div>
                  <div className="sm:col-span-2 lg:col-span-4">
                    <label className="mb-1 block text-xs font-medium text-slate-500">Objective</label>
                    <input
                      className={inpt}
                      value={session.objective}
                      onChange={(e) => patchSession(si, { objective: e.target.value })}
                      placeholder="Session intent…"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 rounded-lg border border-red-900/50 px-3 py-2 text-xs font-medium text-red-300 hover:bg-red-950/40"
                  onClick={() => removeSession(si)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Remove day
                </button>
              </div>

              <div className="overflow-x-auto rounded-lg border border-slate-800 bg-slate-950">
                <table className="w-full min-w-[880px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-900/80 text-xs uppercase tracking-wide text-slate-500">
                      <th className="px-3 py-2 font-medium">Exercise</th>
                      <th className="px-3 py-2 font-medium">Sets</th>
                      <th className="px-3 py-2 font-medium">Reps</th>
                      <th className="px-3 py-2 font-medium">Load</th>
                      <th className="px-3 py-2 font-medium">Rest</th>
                      <th className="min-w-[120px] px-3 py-2 font-medium">Coach note</th>
                      <th className="min-w-[140px] px-3 py-2 font-medium">Form cues</th>
                      <th className="w-10 px-2 py-2" />
                    </tr>
                  </thead>
                  <tbody>
                    {session.exercises.map((ex, ei) => (
                      <tr key={ei} className="border-b border-slate-800/80 last:border-0">
                        <td className="px-2 py-2 align-top">
                          <input
                            className={`${inpt} min-w-[140px]`}
                            value={ex.name}
                            onChange={(e) => patchExercise(si, ei, { name: e.target.value })}
                            placeholder="Movement"
                          />
                        </td>
                        <td className="px-2 py-2 align-top">
                          <input
                            className={`${inpt} max-w-[72px]`}
                            value={ex.sets}
                            onChange={(e) => patchExercise(si, ei, { sets: e.target.value })}
                            placeholder="4"
                          />
                        </td>
                        <td className="px-2 py-2 align-top">
                          <input
                            className={`${inpt} max-w-[88px]`}
                            value={ex.reps}
                            onChange={(e) => patchExercise(si, ei, { reps: e.target.value })}
                            placeholder="6–8"
                          />
                        </td>
                        <td className="px-2 py-2 align-top">
                          <input
                            className={`${inpt} min-w-[100px]`}
                            value={ex.load}
                            onChange={(e) => patchExercise(si, ei, { load: e.target.value })}
                            placeholder="% or kg"
                          />
                        </td>
                        <td className="px-2 py-2 align-top">
                          <input
                            className={`${inpt} max-w-[88px]`}
                            value={ex.rest}
                            onChange={(e) => patchExercise(si, ei, { rest: e.target.value })}
                            placeholder="90s"
                          />
                        </td>
                        <td className="px-2 py-2 align-top">
                          <input
                            className={`${inpt} min-w-[120px]`}
                            value={ex.note ?? ""}
                            onChange={(e) => patchExercise(si, ei, { note: e.target.value })}
                            placeholder="RPE, tempo…"
                          />
                        </td>
                        <td className="px-2 py-2 align-top">
                          <textarea
                            className={`${inpt} min-h-[72px] min-w-[140px] resize-y`}
                            value={ex.formCues ?? ""}
                            onChange={(e) => patchExercise(si, ei, { formCues: e.target.value })}
                            placeholder="Trainer form cues…"
                            rows={2}
                          />
                        </td>
                        <td className="px-1 py-2 align-top">
                          <button
                            type="button"
                            className="rounded-lg p-2 text-slate-500 hover:bg-red-950/50 hover:text-red-300"
                            onClick={() => removeExercise(si, ei)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <button type="button" className={`${btnSecondary} mt-3 text-sm`} onClick={() => addExercise(si)}>
                <Plus className="h-4 w-4" aria-hidden />
                Add exercise
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
