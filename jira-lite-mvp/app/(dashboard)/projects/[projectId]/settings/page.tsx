'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useProject, useUpdateProject, useDeleteProject, useArchiveProject } from '@/hooks/use-projects';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
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
import { ArrowLeft, Loader2, Archive, Trash2 } from 'lucide-react';
import Link from 'next/link';

const updateProjectSchema = z.object({
  name: z
    .string()
    .min(1, '프로젝트 이름은 필수입니다')
    .max(100, '프로젝트 이름은 최대 100자까지 입력 가능합니다'),
  description: z
    .string()
    .max(2000, '프로젝트 설명은 최대 2000자까지 입력 가능합니다')
    .optional(),
});

type UpdateProjectForm = z.infer<typeof updateProjectSchema>;

export default function ProjectSettingsPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = use(params);
  const router = useRouter();
  const { data: project, isLoading } = useProject(projectId);
  const updateMutation = useUpdateProject(projectId);
  const deleteMutation = useDeleteProject();
  const archiveMutation = useArchiveProject(projectId);

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<UpdateProjectForm>({
    resolver: zodResolver(updateProjectSchema),
    values: project
      ? {
          name: project.name,
          description: project.description || '',
        }
      : undefined,
  });

  const onSubmit = async (data: UpdateProjectForm) => {
    await updateMutation.mutateAsync(data);
  };

  const handleDelete = async () => {
    await deleteMutation.mutateAsync(projectId);
    router.push('/projects');
  };

  const handleArchive = async () => {
    await archiveMutation.mutateAsync();
    setShowArchiveDialog(false);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6 max-w-4xl">
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
          <Button onClick={() => router.push('/projects')}>
            프로젝트 목록으로
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/projects/${projectId}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
            프로젝트 설정
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 mt-1">{project.name}</p>
        </div>
      </div>

      <Separator />

      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle>일반 설정</CardTitle>
          <CardDescription>프로젝트의 기본 정보를 수정할 수 있습니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                프로젝트 이름 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                {...register('name')}
                disabled={updateMutation.isPending}
              />
              {errors.name && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="key">프로젝트 키</Label>
              <Input id="key" value={project.key} disabled className="bg-zinc-100 dark:bg-zinc-800" />
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                프로젝트 키는 변경할 수 없습니다.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">프로젝트 설명 (선택)</Label>
              <Textarea
                id="description"
                rows={6}
                {...register('description')}
                disabled={updateMutation.isPending}
                maxLength={2000}
              />
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                마크다운 문법을 사용할 수 있습니다.
              </p>
              {errors.description && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={updateMutation.isPending}
              >
                취소
              </Button>
              <Button
                type="submit"
                disabled={!isDirty || updateMutation.isPending}
              >
                {updateMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                변경사항 저장
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Archive Section */}
      <Card>
        <CardHeader>
          <CardTitle>아카이브</CardTitle>
          <CardDescription>
            {project.is_archived
              ? '이 프로젝트는 현재 아카이브되어 있습니다. 복원하여 다시 활성화할 수 있습니다.'
              : '프로젝트를 아카이브하면 프로젝트 목록에서 숨겨집니다. 언제든지 복원할 수 있습니다.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            onClick={() => setShowArchiveDialog(true)}
            disabled={archiveMutation.isPending}
          >
            {archiveMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Archive className="mr-2 h-4 w-4" />
            )}
            {project.is_archived ? '프로젝트 복원' : '프로젝트 아카이브'}
          </Button>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200 dark:border-red-900">
        <CardHeader>
          <CardTitle className="text-red-600 dark:text-red-400">위험 영역</CardTitle>
          <CardDescription>
            프로젝트를 삭제하면 모든 이슈, 댓글 등이 함께 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="destructive"
            onClick={() => setShowDeleteDialog(true)}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="mr-2 h-4 w-4" />
            )}
            프로젝트 삭제
          </Button>
        </CardContent>
      </Card>

      {/* Archive Confirmation Dialog */}
      <AlertDialog open={showArchiveDialog} onOpenChange={setShowArchiveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {project.is_archived ? '프로젝트를 복원하시겠습니까?' : '프로젝트를 아카이브하시겠습니까?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {project.is_archived
                ? '프로젝트가 복원되면 프로젝트 목록에 다시 표시됩니다.'
                : '아카이브된 프로젝트는 프로젝트 목록에서 숨겨지지만 언제든지 복원할 수 있습니다.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleArchive}>
              {project.is_archived ? '복원' : '아카이브'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>정말로 삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              이 작업은 되돌릴 수 없습니다. <strong>{project.name}</strong> 프로젝트와
              모든 이슈, 댓글이 영구적으로 삭제됩니다.
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
