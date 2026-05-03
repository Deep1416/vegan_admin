"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { fetchPlanRequests, type AdminPlanRequest } from "@/contexts/auth-context";

const STATUSES = ["", "PENDING", "APPROVED", "REJECTED"] as const;

function statusStyle(s: string) {
  switch (s) {
    case "PENDING":
      return "bg-amber-500/15 text-amber-300 border-amber-500/30";
    case "APPROVED":
      return "bg-emerald-500/15 text-emerald-300 border-emerald-500/30";
    case "REJECTED":
      return "bg-red-500/15 text-red-300 border-red-500/30";
    default:
      return "bg-slate-700 text-slate-300 border-slate-600";
  }
}

export default function PlanRequestsPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [data, setData] = useState<Awaited<ReturnType<typeof fetchPlanRequests>> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const d = await fetchPlanRequests(page, 20, statusFilter || undefined);
      setData(d);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
      setData(null);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-white">Plan change requests</h1>
      <p className="mt-1 max-w-3xl text-sm leading-relaxed text-slate-400">
        Gym trainers prescribe exercises by day (sessions change as the week is programmed). Members send updated
        weeks for review; this list is your oversight queue. Use{" "}
        <span className="text-slate-300">View / edit week</span> on pending items to fix structure before approval, or{" "}
        <span className="text-slate-300">Member live plan</span> to see what the app shows after a program is approved.
      </p>

      <div className="mt-6 flex flex-wrap items-end gap-4">
        <div>
          <label className="block text-xs font-medium uppercase tracking-wide text-slate-500">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => {
              setPage(1);
              setStatusFilter(e.target.value);
            }}
            className="mt-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-accent"
          >
            {STATUSES.map((s) => (
              <option key={s || "all"} value={s}>
                {s === "" ? "All statuses" : s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error ? <p className="mt-4 text-sm text-red-400">{error}</p> : null}

      {!data ? (
        <p className="mt-8 text-slate-500">Loading…</p>
      ) : (
        <>
          <div className="mt-6 space-y-3">
            {data.items.map((row: AdminPlanRequest) => (
              <div key={row.id} className="rounded-xl border border-slate-800 bg-slate-900/40">
                <div className="flex flex-wrap items-start justify-between gap-3 px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${statusStyle(row.status)}`}>{row.status}</span>
                      <span className="text-sm font-medium text-slate-100">{row.user.name ?? row.user.email ?? row.user.id}</span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      Trainer: {row.gymTrainer.name} · {new Date(row.createdAt).toLocaleString()}
                    </p>
                    {row.memberNote ? (
                      <p className="mt-2 max-w-3xl text-sm text-slate-400 line-clamp-2">{row.memberNote}</p>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    onClick={() => setExpanded((id) => (id === row.id ? null : row.id))}
                    className="shrink-0 rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800"
                  >
                    {expanded === row.id ? "Hide JSON" : "Raw JSON"}
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 border-t border-slate-800/80 px-4 py-3">
                  <Link
                    href={`/dashboard/plan-requests/${row.id}`}
                    className="inline-flex rounded-lg border border-slate-600 bg-slate-900 px-3 py-1.5 text-xs font-medium text-accent hover:bg-slate-800"
                  >
                    View / edit week
                  </Link>
                  <Link
                    href={`/dashboard/users/${row.user.id}/gym-plan`}
                    className="inline-flex rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800"
                  >
                    Member live plan
                  </Link>
                </div>
                {expanded === row.id ? (
                  <div className="border-t border-slate-800 px-4 py-3">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Proposed sessions JSON</p>
                    <pre className="mt-2 max-h-64 overflow-auto rounded-lg bg-slate-950 p-3 text-xs text-slate-300">{row.proposedSessionsJson}</pre>
                    {row.trainerComment ? (
                      <p className="mt-3 text-sm text-slate-400">
                        <span className="font-medium text-slate-300">Trainer comment:</span> {row.trainerComment}
                      </p>
                    ) : null}
                    {row.reviewedAt ? (
                      <p className="mt-2 text-xs text-slate-500">
                        Reviewed {new Date(row.reviewedAt).toLocaleString()}
                        {row.reviewedBy?.email ? ` · ${row.reviewedBy.email}` : ""}
                      </p>
                    ) : null}
                  </div>
                ) : null}
              </div>
            ))}
          </div>

          {data.items.length === 0 ? (
            <p className="mt-8 rounded-xl border border-dashed border-slate-700 p-8 text-center text-slate-500">No requests in this filter.</p>
          ) : null}

          <div className="mt-6 flex items-center justify-between text-sm text-slate-400">
            <span>
              Page {data.page} of {data.pages} ({data.total} total)
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-lg border border-slate-700 px-3 py-1 hover:bg-slate-800 disabled:opacity-40"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={page >= data.pages}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-lg border border-slate-700 px-3 py-1 hover:bg-slate-800 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
