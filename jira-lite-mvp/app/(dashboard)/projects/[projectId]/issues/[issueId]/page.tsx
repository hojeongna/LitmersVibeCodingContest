'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useProject } from '@/hooks/use-projects';
import { useIssue, useUpdateIssue, useDeleteIssue } from '@/hooks/use-issues';
import { useStatuses } from '@/hooks/use-statuses';
import { useLabels } from '@/hooks/use-labels';
import { useTeamMembers } from '@/hooks/use-members';
import { SubtaskSection } from '@/components/issues/subtask-section';
import { HistorySection } from '@/components/issues/history-section';
import { MarkdownRenderer } from '@/components/shared/markdown-renderer';
import { PriorityBadge } from '@/components/ui/priority-badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  ArrowLeft,
  Calendar,
  User,
  Trash2,
  Edit,
  Clock,
  Tag,
  CheckCircle2,
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

export default function IssueDetailPage({
  params,
}: {
  params: Promise<{ projectId: string; issueId: string }>;
}) {
  const { projectId, issueId } = use(params);
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { user } = useAuth();
  const { data: project } = useProject(projectId);
  const { data: issue, isLoading: issueLoading } = useIssue(issueId);
  const { data: statuses } = useStatuses(projectId);
  const { data: labels } = useLabels(projectId);
  const { data: teamMembers } = useTeamMembers(project?.team_id || null);

  const updateMutation = useUpdateIssue(issueId);
  const deleteMutation = useDeleteIssue();

  const handleStatusChange = (statusId: string) => {
    updateMutation.mutate({ statusId });
  };

  const handleAssigneeChange = (assigneeId: string) => {
    updateMutation.mutate({
      assigneeId: assigneeId === 'unassigned' ? null : assigneeId,
    });
  };

  const handlePriorityChange = (priority: 'HIGH' | 'MEDIUM' | 'LOW') => {
    updateMutation.mutate({ priority });
  };

  const handleDelete = async () => {
    await deleteMutation.mutateAsync({ issueId, projectId });
    router.push(`/projects/${projectId}/issues`);
  };

  if (issueLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6 max-w-6xl">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!issue || !project) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
            이슈를 찾을 수 없습니다
          </h2>
          <Button onClick={() => router.push(`/projects/${projectId}/issues`)}>
            이슈 목록으로
          </Button>
        </div>
      </div>
    );
  }

  const subtasks = issue.subtasks || [];
  const completedSubtasks = subtasks.filter((st) => st.is_completed).length;

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/projects/${projectId}/issues`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-mono text-zinc-500 dark:text-zinc-400">
                {project.key}-{issue.issue_number}
              </span>
              <PriorityBadge priority={issue.priority} />
            </div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
              {issue.title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/projects/${projectId}/issues/${issueId}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              수정
            </Link>
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            삭제
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>설명</CardTitle>
            </CardHeader>
            <CardContent>
              {issue.description ? (
                <MarkdownRenderer content={issue.description} />
              ) : (
                <p className="text-zinc-500 dark:text-zinc-400 italic">
                  설명이 없습니다
                </p>
              )}
            </CardContent>
          </Card>

          {/* Tabs for Subtasks and History */}
          <Tabs defaultValue="subtasks" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="subtasks">
                서브태스크 ({subtasks.length})
              </TabsTrigger>
              <TabsTrigger value="history">히스토리</TabsTrigger>
            </TabsList>
            <TabsContent value="subtasks" className="mt-4">
              <SubtaskSection issueId={issueId} subtasks={subtasks} />
            </TabsContent>
            <TabsContent value="history" className="mt-4">
              <HistorySection issueId={issueId} />
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Status */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                상태
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={issue.status_id}
                onValueChange={handleStatusChange}
                disabled={updateMutation.isPending}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statuses?.map((status) => (
                    <SelectItem key={status.id} value={status.id}>
                      <div className="flex items-center gap-2">
                        {status.color && (
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: status.color }}
                          />
                        )}
                        {status.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Assignee */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <User className="h-4 w-4" />
                담당자
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={issue.assignee_id || 'unassigned'}
                onValueChange={handleAssigneeChange}
                disabled={updateMutation.isPending}
              >
                <SelectTrigger>
                  <SelectValue placeholder="미지정" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">미지정</SelectItem>
                  {teamMembers?.map((member) => (
                    <SelectItem key={member.user_id} value={member.user_id}>
                      {member.profile?.name || member.profile?.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Assign to me button */}
              {user && teamMembers && teamMembers.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-2"
                  onClick={() => {
                    // Check if current user is a team member and not already assigned
                    const currentUserMember = teamMembers.find(
                      (m) => m.user_id === user.uid
                    );
                    if (currentUserMember && issue.assignee_id !== user.uid) {
                      handleAssigneeChange(user.uid);
                    }
                  }}
                  disabled={updateMutation.isPending || issue.assignee_id === user.uid}
                >
                  <User className="mr-2 h-3.5 w-3.5" />
                  나에게 할당
                </Button>
              )}

              {issue.assignee && (
                <div className="flex items-center gap-2 mt-3 p-2 bg-zinc-50 dark:bg-zinc-900 rounded-md">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {issue.assignee.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      {issue.assignee.name}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                      {issue.assignee.email}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Priority */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">우선순위</CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={issue.priority}
                onValueChange={handlePriorityChange}
                disabled={updateMutation.isPending}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">낮음 (LOW)</SelectItem>
                  <SelectItem value="MEDIUM">보통 (MEDIUM)</SelectItem>
                  <SelectItem value="HIGH">높음 (HIGH)</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Due Date */}
          {issue.due_date && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  마감일
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-zinc-900 dark:text-zinc-100">
                  {format(new Date(issue.due_date), 'PPP', { locale: ko })}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Labels */}
          {issue.labels && issue.labels.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  라벨
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1.5">
                  {issue.labels.map((labelWrapper) => (
                    <span
                      key={labelWrapper.label.id}
                      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                      style={{
                        backgroundColor: labelWrapper.label.color + '20',
                        color: labelWrapper.label.color,
                      }}
                    >
                      {labelWrapper.label.name}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Metadata */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Clock className="h-4 w-4" />
                정보
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-500 dark:text-zinc-400">생성일</span>
                <span className="text-zinc-900 dark:text-zinc-100">
                  {format(new Date(issue.created_at), 'PPP', { locale: ko })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500 dark:text-zinc-400">최종 수정</span>
                <span className="text-zinc-900 dark:text-zinc-100">
                  {format(new Date(issue.updated_at), 'PPP', { locale: ko })}
                </span>
              </div>
              {subtasks.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-zinc-500 dark:text-zinc-400">진행률</span>
                  <span className="text-zinc-900 dark:text-zinc-100">
                    {Math.round((completedSubtasks / subtasks.length) * 100)}%
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>이슈를 삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              이 작업은 되돌릴 수 없습니다. <strong>{issue.title}</strong> 이슈와 모든
              서브태스크, 히스토리가 영구적으로 삭제됩니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
