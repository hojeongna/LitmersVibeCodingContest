"use client";

import { use, Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Users, Bell, Activity, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useTeam } from "@/hooks/use-teams";
import { getTeamColor } from "@/types/team";

interface TeamLayoutProps {
  params: Promise<{ teamId: string }>;
  children: React.ReactNode;
}

function TeamLayoutContent({ teamId, children }: { teamId: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: team, isLoading, error } = useTeam(teamId);

  if (isLoading) {
    return <TeamLayoutSkeleton>{children}</TeamLayoutSkeleton>;
  }

  if (error || !team) {
    return (
      <div className="max-w-4xl mx-auto py-12">
        <div className="rounded-lg border border-destructive bg-destructive/10 p-6 text-center">
          <h2 className="text-lg font-semibold mb-2">팀을 찾을 수 없습니다</h2>
          <p className="text-sm text-muted-foreground">
            요청하신 팀이 존재하지 않거나 접근 권한이 없습니다.
          </p>
        </div>
      </div>
    );
  }

  const teamColor = getTeamColor(team.id);
  const createdDate = new Date(team.created_at);
  const userRole = team.currentUserRole || team.role || "MEMBER";

  // Define tabs based on user role
  const tabs = [
    {
      name: "멤버",
      href: `/teams/${teamId}`,
      icon: Users,
      show: true,
    },
    {
      name: "대기 중인 초대",
      href: `/teams/${teamId}/invites`,
      icon: Bell,
      show: userRole === "OWNER" || userRole === "ADMIN",
    },
    {
      name: "활동 로그",
      href: `/teams/${teamId}/activity`,
      icon: Activity,
      show: true,
    },
    {
      name: "설정",
      href: `/teams/${teamId}/settings`,
      icon: Settings,
      show: userRole === "OWNER" || userRole === "ADMIN",
    },
  ].filter((tab) => tab.show);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Team Header */}
      <div className="flex items-start gap-4">
        <div
          className="h-16 w-16 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: teamColor }}
        >
          <span className="text-2xl font-bold text-white">
            {team.name.slice(0, 2).toUpperCase()}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold truncate">{team.name}</h1>
            <Badge variant="outline">{userRole}</Badge>
          </div>
          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              {format(createdDate, "yyyy년 M월 d일", { locale: ko })} 생성
            </span>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b">
        <nav className="flex gap-2 -mb-px" aria-label="Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = pathname === tab.href ||
              (tab.href === `/teams/${teamId}` && pathname === `/teams/${teamId}`);

            return (
              <Link
                key={tab.name}
                href={tab.href}
                className={cn(
                  "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors",
                  isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30"
                )}
              >
                <Icon className="h-4 w-4" />
                {tab.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="pb-8">{children}</div>
    </div>
  );
}

function TeamLayoutSkeleton({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-start gap-4">
        <Skeleton className="h-16 w-16 rounded-xl" />
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <Skeleton className="h-10 w-full max-w-md" />
      <div>{children}</div>
    </div>
  );
}

export default function TeamLayout({ params, children }: TeamLayoutProps) {
  const resolvedParams = use(params);
  const { teamId } = resolvedParams;

  return (
    <Suspense fallback={<TeamLayoutSkeleton>{children}</TeamLayoutSkeleton>}>
      <TeamLayoutContent teamId={teamId}>{children}</TeamLayoutContent>
    </Suspense>
  );
}
