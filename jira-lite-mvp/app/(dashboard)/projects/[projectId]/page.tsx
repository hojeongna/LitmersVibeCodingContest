'use client';

import { useState, use } from 'react';
import { useProject } from '@/hooks/use-projects';
import { useFavoriteProject } from '@/hooks/use-projects';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MarkdownRenderer } from '@/components/shared/markdown-renderer';
import { Star, Settings, FolderKanban, BarChart3, Clock, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CreateIssueModal } from '@/components/issues/create-issue-modal';

export default function ProjectDetailPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = use(params);
  const router = useRouter();
  const { data: project, isLoading } = useProject(projectId);
  const favoriteMutation = useFavoriteProject(projectId);
  const [isCreateIssueOpen, setIsCreateIssueOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-12 w-96" />
        <Skeleton className="h-64 w-full" />
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
          <p className="text-zinc-600 dark:text-zinc-400 mb-6">
            프로젝트가 삭제되었거나 접근 권한이 없습니다.
          </p>
          <Button onClick={() => router.push('/projects')}>
            프로젝트 목록으로
          </Button>
        </div>
      </div>
    );
  }

  const totalIssues = project.issueStats
    ? Object.values(project.issueStats).reduce((sum, count) => sum + count, 0)
    : 0;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <FolderKanban className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 truncate">
              {project.name}
            </h1>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'shrink-0',
                project.isFavorite ? 'text-yellow-500' : 'text-zinc-400'
              )}
              onClick={() => favoriteMutation.mutate()}
              disabled={favoriteMutation.isPending}
            >
              <Star className={cn('h-5 w-5', project.isFavorite && 'fill-current')} />
            </Button>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <Badge variant="outline" className="font-mono">
              {project.key}
            </Badge>
            <span className="text-sm text-zinc-600 dark:text-zinc-400">
              {project.team.name}
            </span>
            {project.is_archived && (
              <Badge variant="outline" className="text-xs">
                보관됨
              </Badge>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button className="gap-2" onClick={() => setIsCreateIssueOpen(true)}>
            <Plus className="h-4 w-4" />
            새 이슈
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/projects/${projectId}/board`}>
              <FolderKanban className="mr-2 h-4 w-4" />
              칸반 보드
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/projects/${projectId}/settings`}>
              <Settings className="mr-2 h-4 w-4" />
              설정
            </Link>
          </Button>
        </div>
      </div>

      <Separator />

      {/* Description */}
      {project.description && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">프로젝트 설명</CardTitle>
          </CardHeader>
          <CardContent>
            <MarkdownRenderer content={project.description} />
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Total Issues */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">전체 이슈</CardTitle>
            <BarChart3 className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalIssues}</div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              프로젝트의 총 이슈 개수
            </p>
          </CardContent>
        </Card>

        {/* Created Date */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">생성일</CardTitle>
            <Clock className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {format(new Date(project.created_at), 'M월 d일', { locale: ko })}
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              {format(new Date(project.created_at), 'yyyy년', { locale: ko })}
            </p>
          </CardContent>
        </Card>

        {/* Owner */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">프로젝트 소유자</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-base font-semibold">{project.owner.name}</div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              {project.owner.email}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Issue Stats by Status */}
      {project.issueStats && Object.keys(project.issueStats).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">상태별 이슈 통계</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {Object.entries(project.issueStats).map(([statusName, count]) => (
                <div
                  key={statusName}
                  className="flex items-center justify-between p-4 rounded-lg border border-zinc-200 dark:border-zinc-800"
                >
                  <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    {statusName}
                  </span>
                  <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">빠른 작업</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button className="gap-2" onClick={() => setIsCreateIssueOpen(true)}>
              <Plus className="h-4 w-4" />
              새 이슈 만들기
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/projects/${projectId}/board`}>
                <FolderKanban className="mr-2 h-4 w-4" />
                칸반 보드 열기
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/projects/${projectId}/settings`}>
                <Settings className="mr-2 h-4 w-4" />
                프로젝트 설정
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <CreateIssueModal
        open={isCreateIssueOpen}
        onOpenChange={setIsCreateIssueOpen}
        projectId={project.id}
        teamId={project.team.id}
      />
    </div>
  );
}
