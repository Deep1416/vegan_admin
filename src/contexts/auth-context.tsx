"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";
import {
  adminFetch,
  getStoredToken,
  getStoredUser,
  loginPassword,
  setStoredSession
} from "@/lib/api";

type AdminUser = { id: string; email: string | null; name: string | null; role: string };

type AuthState = {
  user: AdminUser | null;
  token: string | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = getStoredToken();
    const u = getStoredUser();
    setToken(t);
    if (u?.role === "ADMIN") setUser(u);
    setReady(true);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const data = await loginPassword(email, password);
    if (data.user.role !== "ADMIN") {
      throw new Error("This account does not have admin access.");
    }
    setStoredSession(data.token, data.user);
    setToken(data.token);
    setUser(data.user);
  }, []);

  const logout = useCallback(() => {
    setStoredSession(null, null);
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, token, ready, login, logout }),
    [user, token, ready, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export async function fetchOverview() {
  return adminFetch("/api/admin/overview") as Promise<{
    users: number;
    posts: number;
    recipes: number;
    gymTrainers: number;
    pendingPlanRequests: number;
    members: number;
    trainers: number;
    admins: number;
  }>;
}

export async function fetchUsers(page: number, limit: number, q?: string) {
  const qs = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (q?.trim()) qs.set("q", q.trim());
  return adminFetch(`/api/admin/users?${qs}`) as Promise<{
    items: Array<{
      id: string;
      name: string | null;
      email: string | null;
      role: string;
      onboardingDone: boolean;
      createdAt: string;
      gymTrainerId: string | null;
    }>;
    total: number;
    page: number;
    limit: number;
    pages: number;
  }>;
}

export async function patchUserRole(userId: string, role: string) {
  return adminFetch(`/api/admin/users/${encodeURIComponent(userId)}/role`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ role })
  });
}

export type AdminGymTrainer = {
  id: string;
  name: string;
  title: string | null;
  bio: string | null;
  imageUrl: string | null;
  sortOrder: number;
  linkedUserId: string | null;
  _count: { assignedUsers: number };
};

export async function fetchGymTrainers() {
  return adminFetch("/api/admin/gym-trainers") as Promise<AdminGymTrainer[]>;
}

export async function createGymTrainer(payload: {
  name: string;
  title?: string | null;
  bio?: string | null;
  imageUrl?: string | null;
  sortOrder?: number;
  linkedUserId?: string | null;
}) {
  return adminFetch("/api/admin/gym-trainers", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  }) as Promise<AdminGymTrainer>;
}

export async function updateGymTrainer(
  id: string,
  payload: {
    name?: string;
    title?: string | null;
    bio?: string | null;
    imageUrl?: string | null;
    sortOrder?: number;
    linkedUserId?: string | null;
  }
) {
  return adminFetch(`/api/admin/gym-trainers/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  }) as Promise<AdminGymTrainer>;
}

export async function deleteGymTrainer(id: string) {
  return adminFetch(`/api/admin/gym-trainers/${encodeURIComponent(id)}`, {
    method: "DELETE"
  }) as Promise<{ ok: boolean }>;
}

export type AdminPlanRequest = {
  id: string;
  status: string;
  memberNote: string | null;
  trainerComment: string | null;
  createdAt: string;
  reviewedAt: string | null;
  proposedSessionsJson: string;
  user: { id: string; name: string | null; email: string | null };
  gymTrainer: { id: string; name: string };
  reviewedBy: { id: string; name: string | null; email: string | null } | null;
};

export async function fetchPlanRequests(page: number, limit: number, status?: string) {
  const qs = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (status?.trim()) qs.set("status", status.trim().toUpperCase());
  return adminFetch(`/api/admin/plan-requests?${qs}`) as Promise<{
    items: AdminPlanRequest[];
    total: number;
    page: number;
    limit: number;
    pages: number;
  }>;
}

export type AdminPlanRequestDetail = AdminPlanRequest;

export async function fetchPlanRequestDetail(id: string) {
  return adminFetch(`/api/admin/plan-requests/${encodeURIComponent(id)}`) as Promise<AdminPlanRequestDetail>;
}

export async function patchPlanRequestSessions(id: string, proposedSessionsJson: string) {
  return adminFetch(`/api/admin/plan-requests/${encodeURIComponent(id)}/sessions`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ proposedSessionsJson })
  }) as Promise<{ id: string; status: string; proposedSessionsJson: string; updatedAt: string }>;
}

export async function fetchUserGymPlan(userId: string) {
  return adminFetch(`/api/admin/users/${encodeURIComponent(userId)}/gym-plan`) as Promise<{
    id: string;
    name: string | null;
    email: string | null;
    role: string;
    approvedGymPlanJson: string | null;
  }>;
}

export async function patchUserGymPlan(userId: string, approvedGymPlanJson: string) {
  return adminFetch(`/api/admin/users/${encodeURIComponent(userId)}/gym-plan`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ approvedGymPlanJson })
  }) as Promise<{ id: string; name: string | null; email: string | null; approvedGymPlanJson: string | null; updatedAt: string }>;
}

export type AdminGymPlanRowPayload = {
  day?: string;
  title?: string;
  exercise?: string;
  sets?: string;
  reps?: string;
  load?: string;
  rest?: string;
  formCues?: string;
};

/** POST flat rows → stored sessions on the user (same field the member app reads). */
export async function postUserGymPlanRows(userId: string, rows: AdminGymPlanRowPayload[]) {
  return adminFetch(`/api/admin/users/${encodeURIComponent(userId)}/gym-plan`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ rows })
  }) as Promise<{ id: string; name: string | null; email: string | null; approvedGymPlanJson: string | null; updatedAt: string }>;
}
