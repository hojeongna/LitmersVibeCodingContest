"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Plus, Users } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useTeams } from "@/hooks/use-teams";
import { TeamWithRole, getTeamColor } from "@/types/team";
import { TeamCreateModal } from "./team-create-modal";

interface TeamListProps {
  onTeamSelect?: (teamId: string) => void;
  className?: string;
}

export function TeamList({ onTeamSelect, className }: TeamListProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { data: teams, isLoading, error } = useTeams();

  const getActiveTeamId = (): string | null => {
    const match = pathname.match(/\/teams\/([^/]+)/);
    return match ? match[1] : null;
  };

  const activeTeamId = getActiveTeamId();

  const handleTeamClick = (teamId: string) => {
    onTeamSelect?.(teamId);
    router.push(`/teams/${teamId}`);
  };

  const handleCreateSuccess = (teamId: string) => {
    router.push(`/teams/${teamId}`);
  };

  if (isLoading) {
    return (
      <div className={cn("space-y-1", className)}>
        <div className="flex items-center justify-between px-3 py-2">
          <span className="text-xs font-medium uppercase tracking-wider text-sidebar-muted">
            팀
          </span>
        </div>
        <div className="space-y-1 px-3">
          <Skeleton className="h-8 w-full bg-sidebar-muted/20" />
          <Skeleton className="h-8 w-full bg-sidebar-muted/20" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn("px-3 py-2 text-sm text-destructive", className)}>
        팀 목록을 불러오는데 실패했습니다
      </div>
    );
  }

  return (
    <>
      <div className={cn("space-y-1", className)}>
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2">
          <span className="text-xs font-medium uppercase tracking-wider text-sidebar-muted">
            팀
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 text-sidebar-muted hover:text-sidebar-foreground"
            onClick={() => setIsCreateModalOpen(true)}
            title="새 팀 만들기"
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Team List */}
        <div className="space-y-1">
          {teams && teams.length > 0 ? (
            teams.map((team) => (
              <TeamListItem
                key={team.id}
                team={team}
                isActive={team.id === activeTeamId}
                onClick={() => handleTeamClick(team.id)}
              />
            ))
          ) : (
            <EmptyState onCreateClick={() => setIsCreateModalOpen(true)} />
          )}
        </div>
      </div>

      {/* Create Team Modal */}
      <TeamCreateModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSuccess={handleCreateSuccess}
      />
    </>
  );
}

interface TeamListItemProps {
  team: TeamWithRole;
  isActive: boolean;
  onClick: () => void;
}

function TeamListItem({ team, isActive, onClick }: TeamListItemProps) {
  const teamColor = getTeamColor(team.id);

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
        isActive
          ? "bg-sidebar-active text-white"
          : "text-sidebar-foreground/70 hover:bg-sidebar-hover hover:text-sidebar-foreground"
      )}
    >
      {/* Color dot */}
      <span
        className="h-2 w-2 shrink-0 rounded-full"
        style={{ backgroundColor: teamColor }}
      />
      {/* Team name */}
      <span className="truncate">{team.name}</span>
    </button>
  );
}

interface EmptyStateProps {
  onCreateClick: () => void;
}

function EmptyState({ onCreateClick }: EmptyStateProps) {
  return (
    <div className="px-3 py-4 text-center">
      <Users className="mx-auto h-8 w-8 text-sidebar-muted/50" />
      <p className="mt-2 text-xs text-sidebar-muted">
        아직 팀이 없습니다
      </p>
      <Button
        variant="ghost"
        size="sm"
        className="mt-2 text-xs text-sidebar-muted hover:text-sidebar-foreground"
        onClick={onCreateClick}
      >
        <Plus className="mr-1 h-3 w-3" />
        첫 팀 만들기
      </Button>
    </div>
  );
}
