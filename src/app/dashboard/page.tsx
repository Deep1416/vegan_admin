"use client";

import { ClipboardList, Dumbbell, LayoutDashboard, Users } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchOverview } from "@/contexts/auth-context";

const quickLinks = [
  { href: "/dashboard/users", label: "Users & roles", description: "Search members and change roles", icon: Users },
  { href: "/dashboard/trainers", label: "Gym trainers", description: "Catalog entries and linked accounts", icon: Dumbbell },
  { href: "/dashboard/plan-requests", label: "Plan requests", description: "Review queue oversight", icon: ClipboardList }
];

export default function DashboardPage() {
  const [data, setData] = useState<Awaited<ReturnType<typeof fetchOverview>> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchOverview()
      .then((d) => {
        if (!cancelled) setData(d);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <div>
        <h1 className="text-2xl font-semibold text-white">Overview</h1>
        <p className="mt-4 text-red-400">{error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div>
        <h1 className="text-2xl font-semibold text-white">Overview</h1>
        <p className="mt-4 text-slate-500">Loading metrics…</p>
      </div>
    );
  }

  const cards = [
    { label: "Total users", value: data.users },
    { label: "Members", value: data.members },
    { label: "Gym trainers (accounts)", value: data.trainers },
    { label: "Admins", value: data.admins },
    { label: "Posts", value: data.posts },
    { label: "Recipes", value: data.recipes },
    { label: "Gym trainer profiles", value: data.gymTrainers },
    { label: "Pending plan requests", value: data.pendingPlanRequests }
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold text-white">Overview</h1>
      <p className="mt-1 text-sm text-slate-400">Live counts from your VeganFit backend.</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div
            key={c.label}
            className="rounded-xl border border-slate-800 bg-slate-900/50 px-5 py-4 shadow-sm"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{c.label}</p>
            <p className="mt-2 text-3xl font-semibold tabular-nums text-white">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-10">
        <p className="flex items-center gap-2 text-sm font-medium text-slate-300">
          <LayoutDashboard className="h-4 w-4 text-accent" />
          Quick navigation
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {quickLinks.map(({ href, label, description, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="group flex gap-3 rounded-xl border border-slate-800 bg-slate-900/40 p-4 transition-colors hover:border-slate-700 hover:bg-slate-900/80"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-accent">
                <Icon className="h-5 w-5" />
              </span>
              <span>
                <span className="font-medium text-white group-hover:text-accent">{label}</span>
                <span className="mt-0.5 block text-xs text-slate-500">{description}</span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
