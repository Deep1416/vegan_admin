"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { AdminGymPlanRowsTable } from "@/components/admin-gym-plan-rows-table";
import { AdminGymWeekEditor } from "@/components/admin-gym-week-editor";
import { AdminGymWeekPreview } from "@/components/admin-gym-week-preview";
import { fetchUserGymPlan, patchUserGymPlan, postUserGymPlanRows } from "@/contexts/auth-context";
import type { AdminGymPlanRow } from "@/lib/gym-plan-rows";
import { emptyGymPlanRow, sessionsToRows } from "@/lib/gym-plan-rows";
import type { GymSession } from "@/lib/gym-plan-types";
import { emptySession, parseGymSessionsJson } from "@/lib/gym-plan-types";

function sessionsFromStored(json: string | null): GymSession[] {
  if (!json?.trim()) return [emptySession()];
  const parsed = parseGymSessionsJson(json);
  return parsed.length ? parsed : [emptySession()];
}

export default function UserGymPlanPage() {
  const params = useParams();
  const userId = typeof params?.id === "string" ? params.id : "";

  const [name, setName] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [role, setRole] = useState<string>("");
  const [sessions, setSessions] = useState<GymSession[]>([]);
  const [gridRows, setGridRows] = useState<AdminGymPlanRow[]>([emptyGymPlanRow()]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [savingGrid, setSavingGrid] = useState(false);

  const load = useCallback(async () => {
    if (!userId) return;
    setError(null);
    try {
      const u = await fetchUserGymPlan(userId);
      setName(u.name);
      setEmail(u.email);
      setRole(u.role);
      const s = sessionsFromStored(u.approvedGymPlanJson);
      setSessions(s);
      setGridRows(sessionsToRows(s));
      setLoaded(true);
    } catch (e) {
      setLoaded(true);
      setError(e instanceof Error ? e.message : "Failed to load");
    }
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  async function onSave() {
    if (!userId) return;
    setSaving(true);
    setError(null);
    try {
      const json = JSON.stringify(sessions);
      await patchUserGymPlan(userId, json);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function onSaveFromGrid() {
    if (!userId) return;
    const hasExercise = gridRows.some((r) => r.exercise.trim());
    if (!hasExercise) {
      setError("Add at least one row with an exercise name before POST.");
      return;
    }
    setSavingGrid(true);
    setError(null);
    try {
      await postUserGymPlanRows(userId, gridRows);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "POST save failed");
    } finally {
      setSavingGrid(false);
    }
  }

  if (!userId) {
    return <p className="text-slate-400">Invalid user id.</p>;
  }

  return (
    <div>
      <div className="text-sm">
        <Link href="/dashboard/users" className="text-accent hover:underline">
          ← Users
        </Link>
      </div>

      <h1 className="mt-4 text-2xl font-semibold text-white">Live gym plan</h1>
      <p className="mt-1 text-sm text-slate-400">
        {name ?? "—"} · {email ?? userId} · {role}
      </p>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500">
        Use the <span className="text-slate-300">grid</span> below (POST) for day / title / exercise columns, or the structured editor
        (PATCH JSON). Both write <code className="rounded bg-slate-900 px-1 text-slate-300">User.approvedGymPlanJson</code> — the
        member gym page already fetches the user and shows this program.
      </p>

      {error ? <p className="mt-4 text-sm text-red-400">{error}</p> : null}

      {loaded ? (
        <div className="mt-8 space-y-10">
          <AdminGymPlanRowsTable
            rows={gridRows}
            onChangeRows={setGridRows}
            onSavePost={onSaveFromGrid}
            saving={savingGrid}
            disabled={!loaded}
          />
          <AdminGymWeekEditor
            sessions={sessions}
            onChange={setSessions}
            title="Approved program (advanced)"
            description="Each training day can list different exercises. Save with the button below (PATCH). After save, the grid reloads from the stored JSON."
          />
          <AdminGymWeekPreview sessions={sessions} />
        </div>
      ) : (
        <p className="mt-8 text-slate-500">Loading…</p>
      )}

      <div className="mt-8">
        <button
          type="button"
          disabled={!loaded || saving}
          onClick={onSave}
          className="rounded-lg border border-slate-600 bg-slate-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {saving ? "Saving…" : "PATCH — save from advanced editor"}
        </button>
      </div>
    </div>
  );
}
