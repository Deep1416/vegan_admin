"use client";

import clsx from "clsx";
import { ClipboardList, Dumbbell, LayoutDashboard, LogOut, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";

const links: {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  active: (pathname: string) => boolean;
}[] = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, active: (p) => p === "/dashboard" },
  { href: "/dashboard/users", label: "Users", icon: Users, active: (p) => p.startsWith("/dashboard/users") },
  { href: "/dashboard/trainers", label: "Gym trainers", icon: Dumbbell, active: (p) => p.startsWith("/dashboard/trainers") },
  {
    href: "/dashboard/plan-requests",
    label: "Plan requests",
    icon: ClipboardList,
    active: (p) => p.startsWith("/dashboard/plan-requests")
  }
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { logout, user } = useAuth();

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-56 flex-col border-r border-slate-800 bg-slate-900/80">
        <div className="border-b border-slate-800 px-4 py-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-accent">VeganFit</p>
          <p className="text-sm font-medium text-slate-200">Admin</p>
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-3">
          {links.map(({ href, label, icon: Icon, active }) => (
            <Link
              key={href}
              href={href}
              className={clsx(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                active(pathname)
                  ? "bg-slate-800 text-white"
                  : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-100"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-slate-800 p-3">
          <p className="truncate px-1 text-xs text-slate-500">{user?.email ?? "—"}</p>
          <button
            type="button"
            onClick={() => logout()}
            className="mt-2 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-400 hover:bg-slate-800 hover:text-slate-100"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto bg-slate-950 p-8">{children}</main>
    </div>
  );
}
