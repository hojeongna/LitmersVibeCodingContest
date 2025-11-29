"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, FolderKanban, Users, BarChart3, ArrowRight } from "lucide-react";
import Link from "next/link";
import { CreateIssueModal } from "@/components/issues/create-issue-modal";
import { ProjectCreateModal } from "@/components/projects/project-create-modal";
import { useProjects } from "@/hooks/use-projects";
import { useTeams } from "@/hooks/use-teams";
import { useTeamMembers } from "@/hooks/use-members";
import { useQueries } from "@tanstack/react-query";
import { toast } from "sonner";
import type { BoardData } from "@/types/kanban";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function DashboardPage() {
  const [isCreateIssueOpen, setIsCreateIssueOpen] = useState(false);
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  
  const { data: projects } = useProjects();
  const { data: teams } = useTeams();

  // 활성 프로젝트 필터링
  const activeProjects = projects?.filter(p => !p.is_archived) || [];

  // 선택된 프로젝트 찾기
  const selectedProject = selectedProjectId
    ? activeProjects.find(p => p.id === selectedProjectId)
    : activeProjects[0];

  // 선택된 프로젝트의 팀 찾기
  const selectedTeam = selectedProject
    ? teams?.find(t => t.id === selectedProject.team_id)
    : teams?.[0];

  // 팀 멤버 조회
  const { data: teamMembers } = useTeamMembers(selectedTeam?.id || null);

  // 각 프로젝트의 칸반 데이터 조회
  const kanbanQueries = useQueries({
    queries: activeProjects.map((project) => ({
      queryKey: ['kanban', project.id],
      queryFn: async () => {
        const response = await fetch(`/api/projects/${project.id}/board`);
        if (!response.ok) throw new Error('Failed to fetch kanban');
        const result = await response.json();
        return result.data as BoardData;
      },
      staleTime: 30 * 1000,
    })),
  });

  // 통계 계산
  const stats = useMemo(() => {
    const totalIssues = activeProjects.reduce((acc, p) => acc + (p.issueCount || 0), 0);
    const memberCount = teamMembers?.length || 0;

    // 칸반 데이터에서 진행 중/완료 이슈 수 계산
    let inProgress = 0;
    let completed = 0;

    kanbanQueries.forEach((query) => {
      if (query.data?.columns) {
        query.data.columns.forEach((column) => {
          const statusName = column.status.name.toLowerCase();
          // Done/완료 상태
          if (statusName.includes('done') || statusName.includes('완료')) {
            completed += column.issueCount;
          }
          // 진행 중 상태 (In Progress, Review 등 Backlog/Done 제외 모두)
          else if (!statusName.includes('backlog') && !statusName.includes('todo') && !statusName.includes('대기')) {
            inProgress += column.issueCount;
          }
        });
      }
    });

    return {
      totalIssues,
      inProgress,
      completed,
      memberCount,
    };
  }, [activeProjects, teamMembers, kanbanQueries]);

  const [isProjectSelectOpen, setIsProjectSelectOpen] = useState(false);

  const handleCreateIssue = () => {
    // 프로젝트가 없으면 프로젝트 생성 모달 열기
    if (activeProjects.length === 0) {
      toast.error("먼저 프로젝트를 생성해주세요");
      setIsCreateProjectOpen(true);
      return;
    }
    
    // 프로젝트가 하나면 바로 선택하고 이슈 생성 모달 열기
    if (activeProjects.length === 1) {
      setSelectedProjectId(activeProjects[0].id);
      setIsCreateIssueOpen(true);
      return;
    }

    // 프로젝트가 여러 개면 선택 모달 열기
    setIsProjectSelectOpen(true);
  };

  const handleProjectSelect = (projectId: string) => {
    setSelectedProjectId(projectId);
    setIsProjectSelectOpen(false);
    setIsCreateIssueOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">대시보드</h1>
          <p className="text-muted-foreground">
            프로젝트와 이슈를 한눈에 확인하세요.
          </p>
        </div>
        <Button className="gap-2" onClick={handleCreateIssue}>
          <Plus className="h-4 w-4" />
          새 이슈
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">전체 이슈</CardTitle>
            <FolderKanban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalIssues}</div>
            <p className="text-xs text-muted-foreground">
              활성 프로젝트에서
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">진행 중</CardTitle>
            <BarChart3 className="h-4 w-4 text-column-progress" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inProgress}</div>
            <p className="text-xs text-muted-foreground">
              내 담당 이슈
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">완료</CardTitle>
            <BarChart3 className="h-4 w-4 text-column-done" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
            <p className="text-xs text-muted-foreground">
              이번 주 완료
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">팀 멤버</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.memberCount}</div>
            <p className="text-xs text-muted-foreground">
              활성 멤버
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Projects List or Empty State */}
      {activeProjects.length > 0 ? (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>내 프로젝트</CardTitle>
              <CardDescription>
                활성 프로젝트 {activeProjects.length}개
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" className="gap-2" onClick={() => setIsCreateProjectOpen(true)}>
              <Plus className="h-4 w-4" />
              새 프로젝트
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {activeProjects.map((project) => (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}/board`}
                  className="block"
                >
                  <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{project.name}</CardTitle>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <FolderKanban className="h-3.5 w-3.5" />
                          {project.issueCount || 0} 이슈
                        </span>
                        <span>{project.team?.name}</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>시작하기</CardTitle>
            <CardDescription>
              Litmers에 오신 것을 환영합니다! AI 기반 이슈 트래킹을 시작하세요.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-8 text-center">
            <div className="rounded-full bg-primary/10 p-4 mb-4">
              <FolderKanban className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">첫 프로젝트 만들기</h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-sm">
              프로젝트를 만들어 이슈를 관리하고, AI의 도움을 받아 더 효율적으로 작업하세요.
            </p>
            <Button className="gap-2" onClick={() => setIsCreateProjectOpen(true)}>
              <Plus className="h-4 w-4" />
              프로젝트 만들기
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Project Selection Dialog */}
      <Dialog open={isProjectSelectOpen} onOpenChange={setIsProjectSelectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>프로젝트 선택</DialogTitle>
            <DialogDescription>
              이슈를 생성할 프로젝트를 선택해주세요.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {activeProjects.map((project) => (
              <Button
                key={project.id}
                variant="outline"
                className="justify-start h-auto py-3 px-4"
                onClick={() => handleProjectSelect(project.id)}
              >
                <div className="flex flex-col items-start gap-1">
                  <span className="font-medium">{project.name}</span>
                  <span className="text-xs text-muted-foreground">{project.key}</span>
                </div>
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Modals */}
      {selectedProject && selectedTeam && (
        <CreateIssueModal
          open={isCreateIssueOpen}
          onOpenChange={setIsCreateIssueOpen}
          projectId={selectedProject.id}
          teamId={selectedTeam.id}
        />
      )}
      
      <ProjectCreateModal
        open={isCreateProjectOpen}
        onOpenChange={setIsCreateProjectOpen}
        defaultTeamId={teams?.[0]?.id}
      />
    </div>
  );
}
