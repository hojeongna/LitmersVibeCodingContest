'use client';

import { useState } from 'react';
import { useProjects } from '@/hooks/use-projects';
import { ProjectCard } from '@/components/projects/project-card';
import { ProjectCreateModal } from '@/components/projects/project-create-modal';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, FolderKanban } from 'lucide-react';

export default function ProjectsPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const { data: allProjects, isLoading } = useProjects();

  // 아카이브 필터링
  const projects = allProjects?.filter((p) =>
    showArchived ? p.is_archived : !p.is_archived
  );

  // 즐겨찾기와 일반 프로젝트 분리
  const favoriteProjects = projects?.filter((p) => p.isFavorite) || [];
  const regularProjects = projects?.filter((p) => !p.isFavorite) || [];

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
            프로젝트
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 mt-1">
            팀의 프로젝트를 관리하세요
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          새 프로젝트
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={showArchived ? 'archived' : 'active'} onValueChange={(v) => setShowArchived(v === 'archived')}>
        <TabsList>
          <TabsTrigger value="active">활성 프로젝트</TabsTrigger>
          <TabsTrigger value="archived">아카이브</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Empty State */}
      {projects && projects.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <FolderKanban className="h-16 w-16 text-zinc-300 dark:text-zinc-700 mb-4" />
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
            {showArchived ? '아카이브된 프로젝트가 없습니다' : '프로젝트가 없습니다'}
          </h3>
          <p className="text-zinc-600 dark:text-zinc-400 mb-6">
            {showArchived
              ? '아카이브된 프로젝트가 여기에 표시됩니다.'
              : '첫 번째 프로젝트를 만들어 시작하세요!'}
          </p>
          {!showArchived && (
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              프로젝트 만들기
            </Button>
          )}
        </div>
      )}

      {/* Favorite Projects */}
      {!showArchived && favoriteProjects.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            ⭐ 즐겨찾기
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {favoriteProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </div>
      )}

      {/* Regular Projects */}
      {regularProjects.length > 0 && (
        <div className="space-y-4">
          {!showArchived && favoriteProjects.length > 0 && (
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
              모든 프로젝트
            </h2>
          )}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {regularProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </div>
      )}

      {/* Create Project Modal */}
      <ProjectCreateModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
      />
    </div>
  );
}
