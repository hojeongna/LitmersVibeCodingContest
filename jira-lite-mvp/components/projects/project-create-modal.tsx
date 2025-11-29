'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
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
import { useCreateProject } from '@/hooks/use-projects';
import { useTeams } from '@/hooks/use-teams';
import { Loader2 } from 'lucide-react';

const createProjectSchema = z.object({
  name: z
    .string()
    .min(1, '프로젝트 이름은 필수입니다')
    .max(100, '프로젝트 이름은 최대 100자까지 입력 가능합니다'),
  description: z
    .string()
    .max(2000, '프로젝트 설명은 최대 2000자까지 입력 가능합니다')
    .optional(),
  teamId: z.string().min(1, '팀을 선택해주세요'),
  key: z
    .string()
    .min(2, '프로젝트 키는 최소 2자 이상이어야 합니다')
    .max(10, '프로젝트 키는 최대 10자까지 입력 가능합니다')
    .regex(/^[A-Z]+$/, '프로젝트 키는 대문자 영문만 가능합니다')
    .optional(),
});

type CreateProjectForm = z.infer<typeof createProjectSchema>;

interface ProjectCreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTeamId?: string;
}

export function ProjectCreateModal({
  open,
  onOpenChange,
  defaultTeamId,
}: ProjectCreateModalProps) {
  const router = useRouter();
  const { data: teams, isLoading: teamsLoading } = useTeams();
  const createMutation = useCreateProject();
  const [autoGenerateKey, setAutoGenerateKey] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<CreateProjectForm>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      teamId: defaultTeamId || '',
      description: '',
      key: '',
    },
  });

  const projectName = watch('name');
  const projectKey = watch('key');

  // 프로젝트 이름이 변경되면 자동으로 키 생성
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setValue('name', value);

    if (autoGenerateKey && value) {
      const words = value.split(/\s+/).filter(Boolean);
      const generatedKey = words
        .slice(0, 3)
        .map((word) => word[0].toUpperCase())
        .join('');

      setValue('key', generatedKey.length >= 2 ? generatedKey : value.slice(0, 2).toUpperCase());
    }
  };

  const handleKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    setValue('key', value);
    setAutoGenerateKey(false);
  };

  const onSubmit = async (data: CreateProjectForm) => {
    try {
      const project = await createMutation.mutateAsync(data);
      reset();
      onOpenChange(false);
      // AC-10: 프로젝트 생성 후 해당 프로젝트 페이지로 이동
      router.push(`/projects/${project.id}/board`);
    } catch (error) {
      // 에러는 mutation의 onError에서 처리
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && !createMutation.isPending) {
      reset();
      setAutoGenerateKey(true);
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>새 프로젝트 만들기</DialogTitle>
          <DialogDescription>
            팀의 작업을 체계적으로 관리할 프로젝트를 만들어보세요.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* 팀 선택 */}
          <div className="space-y-2">
            <Label htmlFor="teamId">
              팀 <span className="text-red-500">*</span>
            </Label>
            {teamsLoading ? (
              <div className="h-10 rounded-md border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900" />
            ) : (
              <Select
                value={watch('teamId')}
                onValueChange={(value) => setValue('teamId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="팀을 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {teams?.map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {errors.teamId && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {errors.teamId.message}
              </p>
            )}
          </div>

          {/* 프로젝트 이름 */}
          <div className="space-y-2">
            <Label htmlFor="name">
              프로젝트 이름 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              placeholder="예: My Project"
              {...register('name')}
              onChange={handleNameChange}
              disabled={createMutation.isPending}
            />
            {errors.name && (
              <p className="text-sm text-red-600 dark:text-red-400">{errors.name.message}</p>
            )}
          </div>

          {/* 프로젝트 키 */}
          <div className="space-y-2">
            <Label htmlFor="key">프로젝트 키 (선택)</Label>
            <Input
              id="key"
              placeholder="예: JL"
              {...register('key')}
              onChange={handleKeyChange}
              disabled={createMutation.isPending}
              maxLength={10}
            />
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {autoGenerateKey && projectName
                ? '이름에서 자동 생성됩니다. 직접 입력도 가능합니다.'
                : '대문자 영문 2-10자 (예: JL, PROJ)'}
            </p>
            {errors.key && (
              <p className="text-sm text-red-600 dark:text-red-400">{errors.key.message}</p>
            )}
          </div>

          {/* 프로젝트 설명 */}
          <div className="space-y-2">
            <Label htmlFor="description">프로젝트 설명 (선택)</Label>
            <Textarea
              id="description"
              placeholder="프로젝트에 대한 간단한 설명을 입력하세요..."
              rows={4}
              {...register('description')}
              disabled={createMutation.isPending}
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
              {createMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              프로젝트 만들기
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
