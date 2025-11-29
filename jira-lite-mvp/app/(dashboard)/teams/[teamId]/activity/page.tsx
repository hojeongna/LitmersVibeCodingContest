"use client";

import { use } from "react";
import { useTeamActivities } from "@/hooks/use-activities";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar } from "@/components/ui/avatar";
import {
  Mail,
  UserPlus,
  UserMinus,
  LogOut,
  Shield,
  Crown,
  Settings,
  Trash2,
  RefreshCw,
  Activity as ActivityIcon,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";

interface ActivityPageProps {
  params: Promise<{ teamId: string }>;
}

export default function ActivityPage({ params }: ActivityPageProps) {
  const { teamId } = use(params);
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useTeamActivities(teamId);

  const activities = data?.pages.flatMap((page) => page.data) || [];

  const getActivityIcon = (action: string) => {
    switch (action) {
      case "member_invited":
        return <Mail className="h-4 w-4 text-green-600" />;
      case "member_joined":
        return <UserPlus className="h-4 w-4 text-blue-600" />;
      case "role_changed":
        return <RefreshCw className="h-4 w-4 text-amber-600" />;
      case "ownership_transferred":
        return <Crown className="h-4 w-4 text-amber-600" />;
      case "member_removed":
        return <UserMinus className="h-4 w-4 text-red-600" />;
      case "member_left":
        return <LogOut className="h-4 w-4 text-gray-600" />;
      case "team_updated":
        return <Settings className="h-4 w-4 text-purple-600" />;
      case "team_deleted":
        return <Trash2 className="h-4 w-4 text-red-600" />;
      default:
        return <ActivityIcon className="h-4 w-4 text-gray-600" />;
    }
  };

  const getActivityText = (activity: any) => {
    const actorName = activity.actor?.name || "알 수 없는 사용자";
    const details = activity.details || {};

    switch (activity.action) {
      case "member_invited":
        return (
          <>
            <strong>{actorName}</strong>님이 <strong>{details.email}</strong>을(를){" "}
            <span className="text-muted-foreground">
              {details.role === "ADMIN" ? "관리자" : "멤버"}
            </span>로 초대했습니다
          </>
        );
      case "member_joined":
        return (
          <>
            <strong>{actorName}</strong>님이 팀에 가입했습니다
          </>
        );
      case "role_changed":
        return (
          <>
            <strong>{actorName}</strong>님이 역할을{" "}
            <span className="text-muted-foreground">{details.from}</span>에서{" "}
            <span className="text-muted-foreground">{details.to}</span>(으)로 변경했습니다
          </>
        );
      case "ownership_transferred":
        return (
          <>
            <strong>{actorName}</strong>님이 소유권을 이전했습니다
          </>
        );
      case "member_removed":
        return (
          <>
            <strong>{actorName}</strong>님이 멤버를 퇴장시켰습니다
          </>
        );
      case "member_left":
        return (
          <>
            <strong>{actorName}</strong>님이 팀에서 탈퇴했습니다
          </>
        );
      case "team_updated":
        if (details.field === "name") {
          return (
            <>
              <strong>{actorName}</strong>님이 팀 이름을{" "}
              <span className="text-muted-foreground">"{details.from}"</span>에서{" "}
              <span className="text-muted-foreground">"{details.to}"</span>(으)로 변경했습니다
            </>
          );
        }
        return (
          <>
            <strong>{actorName}</strong>님이 팀 설정을 변경했습니다
          </>
        );
      case "team_deleted":
        return (
          <>
            <strong>{actorName}</strong>님이 팀을 삭제했습니다
          </>
        );
      default:
        return (
          <>
            <strong>{actorName}</strong>님이 작업을 수행했습니다
          </>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">활동 로그</h2>
          <p className="text-muted-foreground">팀의 활동 내역입니다</p>
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex gap-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">활동 로그</h2>
        <p className="text-muted-foreground">
          팀의 활동 내역입니다 ({data?.pages[0]?.pagination.total || 0}개)
        </p>
      </div>

      {activities.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 px-4">
          <ActivityIcon className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold mb-1">활동 내역이 없습니다</h3>
          <p className="text-sm text-muted-foreground text-center">
            팀에서 활동이 발생하면 여기에 표시됩니다
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="flex gap-4 items-start pb-4 border-b last:border-0"
              >
                <div className="relative">
                  <Avatar className="h-10 w-10">
                    {activity.actor?.avatar_url ? (
                      <img
                        src={activity.actor.avatar_url}
                        alt={activity.actor.name || "User"}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-primary/10 text-primary font-semibold">
                        {activity.actor?.name?.[0]?.toUpperCase() || "?"}
                      </div>
                    )}
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-1 border">
                    {getActivityIcon(activity.action)}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm">{getActivityText(activity)}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(activity.created_at), {
                      addSuffix: true,
                      locale: ko,
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {hasNextPage && (
            <div className="flex justify-center pt-4">
              <Button
                variant="outline"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
              >
                {isFetchingNextPage ? "로딩 중..." : "더 보기"}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
