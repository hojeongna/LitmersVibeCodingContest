'use client';

import { use, useState } from 'react';
import { useProject } from '@/hooks/use-projects';
import { useIssues } from '@/hooks/use-issues';
import { useStatuses } from '@/hooks/use-statuses';
import { useLabels } from '@/hooks/use-labels';
import { useTeamMembers } from '@/hooks/use-members';
import { IssueList } from '@/components/issues/issue-list';
import { CreateIssueModal } from '@/components/issues/create-issue-modal';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, ArrowLeft, Settings } from 'lucide-react';
import Link from 'next/link';

export default function ProjectIssuesPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = use(params);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const { data: project, isLoading: projectLoading } = useProject(projectId);
  const { data: issues, isLoading: issuesLoading } = useIssues(projectId);
  const { data: statuses } = useStatuses(projectId);
  const { data: labels } = useLabels(projectId);
  const { data: teamMembers } = useTeamMembers(project?.team_id || null);

  if (projectLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6 max-w-6xl">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
            프로젝트를 찾을 수 없습니다
          </h2>
          <Button asChild>
            <Link href="/projects">프로젝트 목록으로</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/projects/${projectId}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
              {project.name} - 이슈
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400 mt-1">
              프로젝트의 모든 이슈를 검색하고 관리하세요
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/projects/${projectId}/settings`}>
              <Settings className="mr-2 h-4 w-4" />
              설정
            </Link>
          </Button>
          <Button size="sm" onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            새 이슈
          </Button>
        </div>
      </div>

      {/* Issue List with Filters */}
      <IssueList
        issues={issues || []}
        projectKey={project.key}
        isLoading={issuesLoading}
        statuses={statuses}
        teamMembers={teamMembers}
        labels={labels}
      />

      {/* Create Issue Modal */}
      <CreateIssueModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        projectId={projectId}
        teamId={project.team_id}
      />
    </div>
  );
}
