import { getBackendUrl } from "./env";

const TOKEN_KEY = "vf_admin_token";
const USER_KEY = "vf_admin_user";

export type StoredAdminUser = { id: string; email: string | null; name: string | null; role: string };

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): StoredAdminUser | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredAdminUser;
  } catch {
    return null;
  }
}

export function setStoredSession(token: string | null, user: StoredAdminUser | null) {
  if (typeof window === "undefined") return;
  if (token && user) {
    window.localStorage.setItem(TOKEN_KEY, token);
    window.localStorage.setItem(USER_KEY, JSON.stringify(user));
  } else {
    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.removeItem(USER_KEY);
  }
}

export async function loginPassword(email: string, password: string) {
  const res = await fetch(`${getBackendUrl()}/api/auth/login/password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(typeof data?.error === "string" ? data.error : "Login failed");
  }
  return data as {
    token: string;
    user: { id: string; email: string | null; name: string | null; role: string };
  };
}

export async function adminFetch(path: string, init?: RequestInit) {
  const token = getStoredToken();
  const headers = new Headers(init?.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const res = await fetch(`${getBackendUrl()}${path}`, {
    ...init,
    headers
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(typeof data?.error === "string" ? data.error : `Request failed (${res.status})`);
  }
  return data;
}
