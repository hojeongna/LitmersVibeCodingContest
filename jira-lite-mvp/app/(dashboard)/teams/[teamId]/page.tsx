"use client";

import { use, Suspense } from "react";
import { Users, Settings, FolderKanban } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useTeam } from "@/hooks/use-teams";

interface TeamPageProps {
  params: Promise<{ teamId: string }>;
}

function TeamPageContent({ teamId }: { teamId: string }) {
  const { data: team, isLoading } = useTeam(teamId);

  if (isLoading) {
    return <TeamPageSkeleton />;
  }

  if (!team) {
    return null; // Layout will handle error state
  }

  const userRole = team.currentUserRole || team.role || "MEMBER";

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">팀 멤버</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-muted-foreground">
              멤버를 초대하여 팀을 구성하세요
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">프로젝트</CardTitle>
            <FolderKanban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              첫 프로젝트를 생성하세요
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">내 역할</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userRole}</div>
            <p className="text-xs text-muted-foreground">
              {userRole === "OWNER" && "팀의 모든 권한을 보유"}
              {userRole === "ADMIN" && "팀 관리 권한 보유"}
              {userRole === "MEMBER" && "일반 멤버 권한"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>최근 활동</CardTitle>
          <CardDescription>팀의 최근 활동 내역입니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            아직 활동 내역이 없습니다.
          </p>
        </CardContent>
      </Card>

      {/* Projects Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>프로젝트</CardTitle>
          <CardDescription>이 팀에 속한 프로젝트 목록입니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            아직 프로젝트가 없습니다. 새 프로젝트를 생성하세요.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function TeamPageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
      <Skeleton className="h-48" />
      <Skeleton className="h-48" />
    </div>
  );
}

export default function TeamPage({ params }: TeamPageProps) {
  const resolvedParams = use(params);
  const { teamId } = resolvedParams;

  return (
    <Suspense fallback={<TeamPageSkeleton />}>
      <TeamPageContent teamId={teamId} />
    </Suspense>
  );
}
