"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";

export function DashboardGate({ children }: { children: React.ReactNode }) {
  const { ready, token } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!ready) return;
    if (!token) router.replace("/login");
  }, [ready, token, router]);

  if (!ready || !token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-400">
        Loading…
      </div>
    );
  }

  return <>{children}</>;
}
