import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { Status, CreateStatusRequest, UpdateStatusRequest, DeleteStatusResponse } from '@/types/status';

export function useStatuses(projectId: string) {
  return useQuery<Status[]>({
    queryKey: ['statuses', projectId],
    queryFn: async () => {
      const response = await fetch(`/api/projects/${projectId}/statuses`);
      if (!response.ok) {
        throw new Error('Failed to fetch statuses');
      }
      const result = await response.json();
      return result.data.statuses;
    },
    staleTime: 60 * 1000, // 1분
    refetchOnWindowFocus: true,
  });
}

export function useCreateStatus(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateStatusRequest) => {
      const response = await fetch(`/api/projects/${projectId}/statuses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to create status');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['statuses', projectId] });
      queryClient.invalidateQueries({ queryKey: ['kanban', projectId] });
      toast.success('상태가 생성되었습니다');
    },
    onError: (error: Error) => {
      toast.error('상태 생성 실패', {
        description: error.message,
      });
    },
  });
}

export function useUpdateStatus(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ statusId, ...data }: UpdateStatusRequest & { statusId: string }) => {
      const response = await fetch(`/api/statuses/${statusId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to update status');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['statuses', projectId] });
      queryClient.invalidateQueries({ queryKey: ['kanban', projectId] });
      toast.success('상태가 업데이트되었습니다');
    },
    onError: (error: Error) => {
      toast.error('상태 업데이트 실패', {
        description: error.message,
      });
    },
  });
}

export function useDeleteStatus(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (statusId: string) => {
      const response = await fetch(`/api/statuses/${statusId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to delete status');
      }

      const result: DeleteStatusResponse = await response.json();
      return result;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['statuses', projectId] });
      queryClient.invalidateQueries({ queryKey: ['kanban', projectId] });
      toast.success('상태가 삭제되었습니다', {
        description: `${data.data.moved_issues_count}개의 이슈가 Backlog로 이동되었습니다`,
      });
    },
    onError: (error: Error) => {
      toast.error('상태 삭제 실패', {
        description: error.message,
      });
    },
  });
}
