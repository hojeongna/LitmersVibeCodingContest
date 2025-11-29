import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export interface Subtask {
  id: string;
  issue_id: string;
  title: string;
  is_completed: boolean;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface CreateSubtaskInput {
  issueId: string;
  title: string;
}

export interface UpdateSubtaskInput {
  title?: string;
  is_completed?: boolean;
}

export interface ReorderSubtaskInput {
  subtaskId: string;
  newPosition: number;
}

// 서브태스크 생성
export function useCreateSubtask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ issueId, title }: CreateSubtaskInput) => {
      const response = await fetch(`/api/issues/${issueId}/subtasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to create subtask');
      }

      const result = await response.json();
      return result.data as Subtask;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['issues', variables.issueId] });
      toast.success('서브태스크가 추가되었습니다');
    },
    onError: (error: Error) => {
      toast.error('서브태스크 추가 실패', {
        description: error.message,
      });
    },
  });
}

// 서브태스크 수정
export function useUpdateSubtask(subtaskId: string, issueId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateSubtaskInput) => {
      const response = await fetch(`/api/subtasks/${subtaskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to update subtask');
      }

      const result = await response.json();
      return result.data as Subtask;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issues', issueId] });
      // 완료 상태 변경 시에만 토스트 표시 (제목 수정은 조용히)
    },
    onError: (error: Error) => {
      toast.error('서브태스크 수정 실패', {
        description: error.message,
      });
    },
  });
}

// 서브태스크 삭제
export function useDeleteSubtask(issueId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (subtaskId: string) => {
      const response = await fetch(`/api/subtasks/${subtaskId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to delete subtask');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issues', issueId] });
      toast.success('서브태스크가 삭제되었습니다');
    },
    onError: (error: Error) => {
      toast.error('서브태스크 삭제 실패', {
        description: error.message,
      });
    },
  });
}

// 서브태스크 순서 변경
export function useReorderSubtask(issueId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ subtaskId, newPosition }: ReorderSubtaskInput) => {
      const response = await fetch(`/api/subtasks/${subtaskId}/reorder`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ position: newPosition }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to reorder subtask');
      }

      const result = await response.json();
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issues', issueId] });
    },
    onError: (error: Error) => {
      toast.error('순서 변경 실패', {
        description: error.message,
      });
    },
  });
}
