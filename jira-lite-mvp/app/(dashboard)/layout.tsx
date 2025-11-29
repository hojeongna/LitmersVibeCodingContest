"use client";

import { Suspense, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppShell, AppShellSkeleton } from "@/components/layout";
import { useAuth } from "@/components/providers/auth-provider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    // 로딩이 끝나고 사용자가 없으면 로그인 페이지로 리다이렉트
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // 로딩 중이거나 사용자가 없으면 스켈레톤 표시
  if (loading || !user) {
    return <AppShellSkeleton>{children}</AppShellSkeleton>;
  }

  return (
    <Suspense fallback={<AppShellSkeleton>{children}</AppShellSkeleton>}>
      <AppShell>{children}</AppShell>
    </Suspense>
  );
}
