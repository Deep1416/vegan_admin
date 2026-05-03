"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { AdminGymWeekEditor } from "@/components/admin-gym-week-editor";
import { AdminGymWeekPreview } from "@/components/admin-gym-week-preview";
import {
  fetchPlanRequestDetail,
  patchPlanRequestSessions,
  type AdminPlanRequestDetail
} from "@/contexts/auth-context";
import type { GymSession } from "@/lib/gym-plan-types";
import { emptySession, parseGymSessionsJson } from "@/lib/gym-plan-types";

function sessionsFromJson(json: string): GymSession[] {
  const parsed = parseGymSessionsJson(json);
  return parsed.length ? parsed : [emptySession()];
}

export default function PlanRequestDetailPage() {
  const params = useParams();
  const id = typeof params?.id === "string" ? params.id : "";

  const [detail, setDetail] = useState<AdminPlanRequestDetail | null>(null);
  const [sessions, setSessions] = useState<GymSession[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setError(null);
    try {
      const d = await fetchPlanRequestDetail(id);
      setDetail(d);
      setSessions(sessionsFromJson(d.proposedSessionsJson));
    } catch (e) {
      setDetail(null);
      setError(e instanceof Error ? e.message : "Failed to load");
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function onSave() {
    if (!id || !detail) return;
    if (detail.status !== "PENDING") {
      setError("Only PENDING requests can be saved from this screen.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const json = JSON.stringify(sessions);
      const updated = await patchPlanRequestSessions(id, json);
      setDetail((prev) =>
        prev
          ? {
              ...prev,
              proposedSessionsJson: updated.proposedSessionsJson
            }
          : prev
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  if (!id) {
    return <p className="text-slate-400">Invalid request id.</p>;
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <Link href="/dashboard/plan-requests" className="text-accent hover:underline">
          ← Plan requests
        </Link>
        {detail ? (
          <span className="rounded-full border border-slate-700 px-2 py-0.5 text-xs text-slate-400">
            {detail.status}
          </span>
        ) : null}
      </div>

      <h1 className="mt-4 text-2xl font-semibold text-white">Gym week · plan request</h1>
      {detail ? (
        <>
          <p className="mt-1 text-sm text-slate-400">
            Member:{" "}
            <Link href={`/dashboard/users/${detail.user.id}/gym-plan`} className="text-accent hover:underline">
              {detail.user.name ?? detail.user.email ?? detail.user.id}
            </Link>
            {" · "}
            Trainer: {detail.gymTrainer.name}
          </p>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-500">
            Each calendar day can carry a different block of movements, sets, reps, load, rest, and cues as the trainer
            updates the program. Edits here update this submission while it is still pending.
          </p>
        </>
      ) : (
        <p className="mt-1 text-sm text-slate-500">Loading request…</p>
      )}

      {detail?.memberNote ? (
        <div className="mt-4 rounded-xl border border-slate-800 bg-slate-900/40 px-4 py-3 text-sm text-slate-300">
          <span className="font-medium text-slate-200">Member note:</span> {detail.memberNote}
        </div>
      ) : null}

      {error ? <p className="mt-4 text-sm text-red-400">{error}</p> : null}

      {detail && detail.status !== "PENDING" ? (
        <p className="mt-4 rounded-xl border border-amber-900/40 bg-amber-950/20 px-4 py-3 text-sm text-amber-200/90">
          This request is {detail.status}. Editing is disabled here — adjust the member&apos;s{" "}
          <Link href={`/dashboard/users/${detail.user.id}/gym-plan`} className="font-medium text-accent underline">
            live gym plan
          </Link>{" "}
          if you need to change what they see in the app today.
        </p>
      ) : null}

      <div className="mt-8 space-y-8">
        <AdminGymWeekEditor
          sessions={sessions}
          onChange={setSessions}
          title="Edit proposed sessions"
          description="Align each row with the weekday the member trains on. When the trainer changes exercises day by day, this JSON is what gets reviewed—save writes this pending request only; approval still happens in the trainer flow in the main app."
        />
        <AdminGymWeekPreview sessions={sessions} />
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={!detail || detail.status !== "PENDING" || saving}
          onClick={onSave}
          className="rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-slate-950 hover:bg-accent-muted disabled:cursor-not-allowed disabled:opacity-40"
        >
          {saving ? "Saving…" : "Save to database"}
        </button>
        {detail ? (
          <Link
            href={`/dashboard/users/${detail.user.id}/gym-plan`}
            className="rounded-lg border border-slate-600 px-4 py-2 text-sm text-slate-200 hover:bg-slate-800"
          >
            Open member live gym plan
          </Link>
        ) : null}
      </div>
    </div>
  );
}
