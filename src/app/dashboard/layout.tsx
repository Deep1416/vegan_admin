import type { ReactNode } from "react";
import { AdminShell } from "@/components/admin-shell";
import { DashboardGate } from "@/components/dashboard-gate";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <DashboardGate>
      <AdminShell>{children}</AdminShell>
    </DashboardGate>
  );
}
