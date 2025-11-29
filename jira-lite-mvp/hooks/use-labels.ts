import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export interface Label {
  id: string;
  project_id: string;
  name: string;
  color: string;
}

export interface CreateLabelInput {
  name: string;
  color: string;
}

export interface UpdateLabelInput {
  name?: string;
  color?: string;
}

// 프로젝트의 라벨 목록 조회
export function useLabels(projectId: string | null) {
  return useQuery({
    queryKey: ['labels', projectId],
    queryFn: async () => {
      if (!projectId) return [];
      const response = await fetch(`/api/projects/${projectId}/labels`);
      if (!response.ok) throw new Error('Failed to fetch labels');
      const result = await response.json();
      return result.data as Label[];
    },
    enabled: !!projectId,
  });
}

// 라벨 생성
export function useCreateLabel(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateLabelInput) => {
      const response = await fetch(`/api/projects/${projectId}/labels`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to create label');
      }

      const result = await response.json();
      return result.data as Label;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['labels', projectId] });
      toast.success('라벨이 생성되었습니다');
    },
    onError: (error: Error) => {
      toast.error('라벨 생성 실패', {
        description: error.message,
      });
    },
  });
}

// 라벨 수정
export function useUpdateLabel(labelId: string, projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateLabelInput) => {
      const response = await fetch(`/api/labels/${labelId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to update label');
      }

      const result = await response.json();
      return result.data as Label;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['labels', projectId] });
      toast.success('라벨이 수정되었습니다');
    },
    onError: (error: Error) => {
      toast.error('라벨 수정 실패', {
        description: error.message,
      });
    },
  });
}

// 라벨 삭제
export function useDeleteLabel(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (labelId: string) => {
      const response = await fetch(`/api/labels/${labelId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to delete label');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['labels', projectId] });
      toast.success('라벨이 삭제되었습니다');
    },
    onError: (error: Error) => {
      toast.error('라벨 삭제 실패', {
        description: error.message,
      });
    },
  });
}
