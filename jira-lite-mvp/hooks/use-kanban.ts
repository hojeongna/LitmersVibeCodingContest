import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { BoardData, MoveIssueRequest } from '@/types/kanban';

export function useKanban(projectId: string) {
  return useQuery<BoardData>({
    queryKey: ['kanban', projectId],
    queryFn: async () => {
      const response = await fetch(`/api/projects/${projectId}/board`);
      if (!response.ok) {
        throw new Error('Failed to fetch kanban board');
      }
      const result = await response.json();
      return result.data;
    },
    staleTime: 30 * 1000, // 30초
    refetchOnWindowFocus: true,
  });
}

export function useMoveIssue(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ issueId, ...body }: MoveIssueRequest & { issueId: string }) => {
      const response = await fetch(`/api/issues/${issueId}/move`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to move issue');
      }

      return response.json();
    },
    onMutate: async ({ issueId, status_id, position }) => {
      // 진행 중인 쿼리 취소
      await queryClient.cancelQueries({ queryKey: ['kanban', projectId] });

      // 이전 상태 스냅샷 저장
      const previousData = queryClient.getQueryData<BoardData>(['kanban', projectId]);

      // 낙관적 업데이트
      queryClient.setQueryData<BoardData>(['kanban', projectId], (old) => {
        if (!old) return old;

        const newColumns = old.columns.map((column) => ({
          ...column,
          issues: column.issues.filter((issue) => issue.id !== issueId),
        }));

        const issueToMove = old.columns
          .flatMap((col) => col.issues)
          .find((issue) => issue.id === issueId);

        if (issueToMove) {
          const targetColumn = newColumns.find((col) => col.status.id === status_id);
          if (targetColumn) {
            const updatedIssue = { ...issueToMove, status_id, position };
            targetColumn.issues.push(updatedIssue);
            targetColumn.issues.sort((a, b) => a.position - b.position);
            targetColumn.issueCount = targetColumn.issues.length;
          }
        }

        return { columns: newColumns };
      });

      return { previousData };
    },
    onError: (error, _, context) => {
      // 롤백
      if (context?.previousData) {
        queryClient.setQueryData(['kanban', projectId], context.previousData);
      }
      toast.error('이슈 이동 실패', {
        description: error.message,
      });
    },
    onSettled: () => {
      // 서버 상태와 동기화
      queryClient.invalidateQueries({ queryKey: ['kanban', projectId] });
    },
  });
}
