"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Users, Plus, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTeams } from "@/hooks/use-teams";
import { TeamCreateModal } from "@/components/teams/team-create-modal";
import { getTeamColor } from "@/types/team";
import { useState } from "react";

export default function TeamsPage() {
  const router = useRouter();
  const { data: teams, isLoading } = useTeams();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Redirect to first team if available
  useEffect(() => {
    if (teams && teams.length > 0) {
      router.replace(`/teams/${teams[0].id}`);
    }
  }, [teams, router]);

  const handleCreateSuccess = (teamId: string) => {
    router.push(`/teams/${teamId}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // If no teams, show empty state
  if (!teams || teams.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
            <CardTitle>팀이 없습니다</CardTitle>
            <CardDescription>
              첫 번째 팀을 만들어 프로젝트를 관리하고 팀원들과 협업하세요.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              첫 팀 만들기
            </Button>
          </CardContent>
        </Card>

        <TeamCreateModal
          open={isCreateModalOpen}
          onOpenChange={setIsCreateModalOpen}
          onSuccess={handleCreateSuccess}
        />
      </div>
    );
  }

  // Loading indicator while redirecting
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );
}
