"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { fetchUsers, patchUserRole, useAuth } from "@/contexts/auth-context";

const ROLES = ["MEMBER", "GYM_TRAINER", "ADMIN"] as const;

export default function UsersPage() {
  const { user: adminUser } = useAuth();
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [qInput, setQInput] = useState("");
  const [data, setData] = useState<Awaited<ReturnType<typeof fetchUsers>> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const d = await fetchUsers(page, 20, q || undefined);
      setData(d);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load users");
    }
  }, [page, q]);

  useEffect(() => {
    load();
  }, [load]);

  async function onRoleChange(userId: string, role: string) {
    if (userId === adminUser?.id) {
      setError("You cannot change your own role here.");
      return;
    }
    setBusyId(userId);
    setError(null);
    try {
      await patchUserRole(userId, role);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed");
    } finally {
      setBusyId(null);
    }
  }

  function onSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    setQ(qInput.trim());
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-white">Users</h1>
      <p className="mt-1 text-sm text-slate-400">Search users and assign roles (MEMBER, GYM_TRAINER, ADMIN).</p>

      <form onSubmit={onSearch} className="mt-6 flex flex-wrap gap-2">
        <input
          type="search"
          placeholder="Search name or email…"
          value={qInput}
          onChange={(e) => setQInput(e.target.value)}
          className="min-w-[200px] flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-accent"
        />
        <button
          type="submit"
          className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
        >
          Search
        </button>
      </form>

      {error ? <p className="mt-4 text-sm text-red-400">{error}</p> : null}

      {!data ? (
        <p className="mt-8 text-slate-500">Loading…</p>
      ) : (
        <>
          <div className="mt-6 overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-slate-800 bg-slate-900/80 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">User</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Onboarding</th>
                  <th className="px-4 py-3 font-medium">Joined</th>
                  <th className="px-4 py-3 font-medium">Gym plan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {data.items.map((u) => (
                  <tr key={u.id} className="bg-slate-950/50 hover:bg-slate-900/80">
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-100">{u.name ?? "—"}</div>
                      <div className="text-xs text-slate-500">{u.email ?? u.id}</div>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={u.role}
                        disabled={busyId === u.id || u.id === adminUser?.id}
                        onChange={(e) => onRoleChange(u.id, e.target.value)}
                        className="rounded border border-slate-700 bg-slate-950 px-2 py-1 text-xs text-white disabled:opacity-50"
                      >
                        {ROLES.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                      {u.id === adminUser?.id ? (
                        <span className="ml-2 text-xs text-slate-500">(you)</span>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-slate-400">{u.onboardingDone ? "Done" : "Pending"}</td>
                    <td className="px-4 py-3 text-slate-500">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/dashboard/users/${u.id}/gym-plan`}
                        className="text-xs font-medium text-accent hover:underline"
                      >
                        Edit week
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center justify-between text-sm text-slate-400">
            <span>
              Page {data.page} of {data.pages} ({data.total} users)
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
