"use client";

import { use, Suspense, useState } from "react";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTeam } from "@/hooks/use-teams";
import { TeamSettingsForm } from "@/components/teams/team-settings-form";
import { TeamDeleteModal } from "@/components/teams/team-delete-modal";

interface TeamSettingsPageProps {
  params: Promise<{ teamId: string }>;
}

function TeamSettingsContent({ teamId }: { teamId: string }) {
  const router = useRouter();
  const { data: team, isLoading } = useTeam(teamId);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  if (isLoading) {
    return <TeamSettingsSkeleton />;
  }

  if (!team) {
    return null; // Layout will handle error state
  }

  const userRole = team.currentUserRole || team.role || "MEMBER";

  // Check permissions
  if (userRole !== "OWNER" && userRole !== "ADMIN") {
    return (
      <div className="py-12">
        <Card>
          <CardHeader className="text-center">
            <CardTitle>접근 권한 없음</CardTitle>
            <CardDescription>
              팀 설정에 접근할 권한이 없습니다. OWNER 또는 ADMIN 역할이 필요합니다.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Team Information */}
      <Card>
        <CardHeader>
          <CardTitle>팀 정보</CardTitle>
          <CardDescription>팀의 기본 정보를 수정합니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <TeamSettingsForm team={team} />
        </CardContent>
      </Card>

      {/* Danger Zone - Delete Team (OWNER only) */}
      {userRole === "OWNER" && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">🔴 Danger Zone</CardTitle>
            <CardDescription>
              이 영역의 작업은 되돌릴 수 없습니다. 신중하게 진행하세요.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium mb-1">팀 삭제</h3>
              <p className="text-sm text-muted-foreground mb-4">
                팀을 삭제하면 모든 프로젝트, 이슈, 댓글이 함께 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
              </p>
              <Button
                variant="destructive"
                onClick={() => setIsDeleteModalOpen(true)}
              >
                팀 삭제
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delete Modal */}
      <TeamDeleteModal
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        team={team}
        onSuccess={() => {
          router.push("/");
        }}
      />
    </div>
  );
}

function TeamSettingsSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32 mb-2" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}

export default function TeamSettingsPage({ params }: TeamSettingsPageProps) {
  const resolvedParams = use(params);
  const { teamId } = resolvedParams;

  return (
    <Suspense fallback={<TeamSettingsSkeleton />}>
      <TeamSettingsContent teamId={teamId} />
    </Suspense>
  );
}
