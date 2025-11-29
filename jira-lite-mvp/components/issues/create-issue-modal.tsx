'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateIssue } from '@/hooks/use-issues';
import { useLabels } from '@/hooks/use-labels';
import { useStatuses } from '@/hooks/use-statuses';
import { useTeamMembers } from '@/hooks/use-members';
import { Loader2, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { AILabelSuggestion } from '@/components/ai/ai-label-suggestion';
import { DuplicateWarning } from '@/components/ai/duplicate-warning';

const createIssueSchema = z.object({
  title: z
    .string()
    .min(1, '제목은 필수입니다')
    .max(200, '제목은 최대 200자까지 입력 가능합니다'),
  description: z
    .string()
    .max(5000, '설명은 최대 5000자까지 입력 가능합니다')
    .optional(),
  priority: z.enum(['HIGH', 'MEDIUM', 'LOW']),
  statusId: z.string().optional(),
  assigneeId: z.string().optional(),
  dueDate: z.string().optional(),
  labelIds: z.array(z.string()).max(5, '최대 5개의 라벨만 선택할 수 있습니다').optional(),
});

type CreateIssueForm = z.infer<typeof createIssueSchema>;

interface CreateIssueModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  teamId: string;
}

export function CreateIssueModal({
  open,
  onOpenChange,
  projectId,
  teamId,
}: CreateIssueModalProps) {
  const createMutation = useCreateIssue();
  const { data: labels } = useLabels(projectId);
  const { data: statusData } = useStatuses(projectId);
  const { data: teamMembers } = useTeamMembers(teamId);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm<CreateIssueForm>({
    resolver: zodResolver(createIssueSchema),
    defaultValues: {
      priority: 'MEDIUM',
      labelIds: [],
    },
  });

  const selectedLabelIds = watch('labelIds') || [];
  const selectedLabels = labels?.filter((l) => selectedLabelIds.includes(l.id)) || [];

  const toggleLabel = (labelId: string) => {
    const current = selectedLabelIds;
    if (current.includes(labelId)) {
      setValue(
        'labelIds',
        current.filter((id) => id !== labelId)
      );
    } else {
      if (current.length >= 5) {
        return; // 최대 5개 제한
      }
      setValue('labelIds', [...current, labelId]);
    }
  };

  const onSubmit = async (data: CreateIssueForm) => {
    try {
      // 기본 상태 찾기 (Backlog)
      const defaultStatus = statusData?.find((s) => s.name === 'Backlog');
      const statusId = data.statusId || defaultStatus?.id;

      await createMutation.mutateAsync({
        projectId,
        ...data,
        statusId,
      });
      reset();
      onOpenChange(false);
    } catch (error) {
      // 에러는 mutation의 onError에서 처리
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && !createMutation.isPending) {
      reset();
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>새 이슈 만들기</DialogTitle>
          <DialogDescription>프로젝트에 새로운 이슈를 추가합니다.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* 제목 */}
          <div className="space-y-2">
            <Label htmlFor="title">
              제목 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              placeholder="이슈 제목을 입력하세요"
              {...register('title')}
              disabled={createMutation.isPending}
            />
            {errors.title && (
              <p className="text-sm text-red-600 dark:text-red-400">{errors.title.message}</p>
            )}
          </div>

          {/* 설명 */}
          <div className="space-y-2">
            <Label htmlFor="description">설명 (선택)</Label>
            <Textarea
              id="description"
              placeholder="이슈에 대한 상세한 설명을 입력하세요..."
              rows={6}
              {...register('description')}
              disabled={createMutation.isPending}
              maxLength={5000}
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



          <DuplicateWarning projectId={projectId} title={watch('title')} description={watch('description') || ''} />

          <div className="grid grid-cols-2 gap-4">
            {/* 우선순위 */}
            <div className="space-y-2">
              <Label htmlFor="priority">우선순위</Label>
              <Controller
                name="priority"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">낮음 (LOW)</SelectItem>
                      <SelectItem value="MEDIUM">보통 (MEDIUM)</SelectItem>
                      <SelectItem value="HIGH">높음 (HIGH)</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {/* 담당자 */}
            <div className="space-y-2">
              <Label htmlFor="assigneeId">담당자 (선택)</Label>
              <Controller
                name="assigneeId"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="담당자 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">미지정</SelectItem>
                      {teamMembers?.map((member) => (
                        <SelectItem key={member.user_id} value={member.user_id}>
                          {member.profile?.name || member.profile?.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          {/* 마감일 */}
          <div className="space-y-2">
            <Label htmlFor="dueDate">마감일 (선택)</Label>
            <Input
              id="dueDate"
              type="date"
              {...register('dueDate')}
              disabled={createMutation.isPending}
            />
          </div>

          {/* 라벨 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>라벨 (선택, 최대 5개)</Label>
              <AILabelSuggestion 
                  projectId={projectId} 
                  title={watch('title')} 
                  description={watch('description') || ''} 
                  selectedLabels={selectedLabelIds}
                  onLabelSelect={(id) => toggleLabel(id)}
              />
            </div>
            <div className="flex flex-wrap gap-2 p-3 border border-zinc-200 dark:border-zinc-800 rounded-md min-h-[42px]">
              {labels && labels.length > 0 ? (
                labels.map((label) => {
                  const isSelected = selectedLabelIds.includes(label.id);
                  return (
                    <button
                      key={label.id}
                      type="button"
                      onClick={() => toggleLabel(label.id)}
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-all ${
                        isSelected ? 'ring-2 ring-indigo-500' : 'opacity-60 hover:opacity-100'
                      }`}
                      style={{
                        backgroundColor: label.color + '20',
                        color: label.color,
                      }}
                    >
                      {label.name}
                      {isSelected && <X className="ml-1 h-3 w-3" />}
                    </button>
                  );
                })
              ) : (
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  라벨이 없습니다. 프로젝트 설정에서 라벨을 추가하세요.
                </p>
              )}
            </div>
            {errors.labelIds && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {errors.labelIds.message}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={createMutation.isPending}
            >
              취소
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              이슈 만들기
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
