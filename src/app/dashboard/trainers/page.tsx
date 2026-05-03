"use client";

import { useCallback, useEffect, useState } from "react";
import {
  createGymTrainer,
  deleteGymTrainer,
  fetchGymTrainers,
  updateGymTrainer,
  type AdminGymTrainer
} from "@/contexts/auth-context";

export default function TrainersPage() {
  const [rows, setRows] = useState<AdminGymTrainer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [bio, setBio] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [sortOrder, setSortOrder] = useState(0);
  const [linkedUserId, setLinkedUserId] = useState("");

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const data = await fetchGymTrainers();
      setRows(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load trainers");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function resetForm() {
    setEditingId(null);
    setName("");
    setTitle("");
    setBio("");
    setImageUrl("");
    setSortOrder(0);
    setLinkedUserId("");
  }

  function startEdit(t: AdminGymTrainer) {
    setEditingId(t.id);
    setName(t.name);
    setTitle(t.title ?? "");
    setBio(t.bio ?? "");
    setImageUrl(t.imageUrl ?? "");
    setSortOrder(t.sortOrder);
    setLinkedUserId(t.linkedUserId ?? "");
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = {
        name: name.trim(),
        title: title.trim() || null,
        bio: bio.trim() || null,
        imageUrl: imageUrl.trim() || null,
        sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0,
        linkedUserId: linkedUserId.trim() || null
      };
      if (!payload.name) throw new Error("Name is required");

      if (editingId) {
        await updateGymTrainer(editingId, payload);
      } else {
        await createGymTrainer(payload);
      }
      resetForm();
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(id: string) {
    if (!window.confirm("Delete this trainer catalog entry? Only allowed if no members assigned and no plan requests.")) return;
    setError(null);
    try {
      await deleteGymTrainer(id);
      if (editingId === id) resetForm();
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-white">Gym trainers</h1>
      <p className="mt-1 text-sm text-slate-400">
        Catalog shown to members during onboarding and profile. Link a trainer row to a user account ID so they can use the trainer queue.
      </p>

      <form onSubmit={onSubmit} className="mt-8 rounded-xl border border-slate-800 bg-slate-900/50 p-5">
        <p className="text-sm font-medium text-accent">{editingId ? "Edit trainer" : "Add trainer"}</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium uppercase tracking-wide text-slate-500">Name *</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-slate-500">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Strength & conditioning"
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-slate-500">Sort order</label>
            <input
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(parseInt(e.target.value, 10) || 0)}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-accent"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium uppercase tracking-wide text-slate-500">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-accent"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium uppercase tracking-wide text-slate-500">Image URL</label>
            <input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://…"
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-accent"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium uppercase tracking-wide text-slate-500">Linked user ID</label>
            <input
              value={linkedUserId}
              onChange={(e) => setLinkedUserId(e.target.value)}
              placeholder="User cuid — trainer login account"
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 font-mono text-sm text-white outline-none focus:border-accent"
            />
            <p className="mt-1 text-xs text-slate-500">Must match a VeganFit user id with role GYM_TRAINER for plan-review tools.</p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-slate-950 hover:bg-accent-muted disabled:opacity-50"
          >
            {saving ? "Saving…" : editingId ? "Update trainer" : "Create trainer"}
          </button>
          {editingId ? (
            <button type="button" onClick={resetForm} className="rounded-lg border border-slate-600 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800">
              Cancel edit
            </button>
          ) : null}
        </div>
      </form>

      {error ? <p className="mt-4 text-sm text-red-400">{error}</p> : null}

      {loading ? (
        <p className="mt-8 text-slate-500">Loading trainers…</p>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-slate-800 bg-slate-900/80 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Trainer</th>
                <th className="px-4 py-3 font-medium">Order</th>
                <th className="px-4 py-3 font-medium">Assigned</th>
                <th className="px-4 py-3 font-medium">Linked user</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {rows.map((t) => (
                <tr key={t.id} className="bg-slate-950/50 hover:bg-slate-900/80">
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-100">{t.name}</div>
                    <div className="text-xs text-slate-500">{t.title ?? "—"}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-400">{t.sortOrder}</td>
                  <td className="px-4 py-3 text-slate-400">{t._count.assignedUsers}</td>
                  <td className="max-w-[180px] truncate px-4 py-3 font-mono text-xs text-slate-500">{t.linkedUserId ?? "—"}</td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => startEdit(t)}
                      className="mr-2 text-accent hover:underline"
                    >
                      Edit
                    </button>
                    <button type="button" onClick={() => onDelete(t.id)} className="text-red-400 hover:underline">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 ? <p className="p-6 text-center text-slate-500">No trainers yet — create one above.</p> : null}
        </div>
      )}
    </div>
  );
}
