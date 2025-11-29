import { Suspense } from "react";
import { AppShell, AppShellSkeleton } from "@/components/layout";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<AppShellSkeleton>{children}</AppShellSkeleton>}>
      <AppShell>{children}</AppShell>
    </Suspense>
  );
}
