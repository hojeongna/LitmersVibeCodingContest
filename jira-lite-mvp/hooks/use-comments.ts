import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { Comment, CreateCommentRequest, UpdateCommentRequest, CommentsResponse } from '@/types/comment';

export function useComments(issueId: string) {
  return useInfiniteQuery<CommentsResponse['data']>({
    queryKey: ['comments', issueId],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await fetch(`/api/issues/${issueId}/comments?page=${pageParam}&limit=20`);
      if (!response.ok) {
        throw new Error('Failed to fetch comments');
      }
      const result: CommentsResponse = await response.json();
      return result.data;
    },
    getNextPageParam: (lastPage) => {
      return lastPage.pagination.has_more ? lastPage.pagination.page + 1 : undefined;
    },
    initialPageParam: 1,
    staleTime: 30 * 1000,
  });
}

export function useCreateComment(issueId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateCommentRequest) => {
      const response = await fetch(`/api/issues/${issueId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to create comment');
      }

      return response.json();
    },
    onMutate: async (newComment) => {
      await queryClient.cancelQueries({ queryKey: ['comments', issueId] });

      const previousData = queryClient.getQueryData(['comments', issueId]);

      // Optimistic update
      queryClient.setQueryData(['comments', issueId], (old: any) => {
        if (!old) return old;

        const optimisticComment = {
          id: `temp-${Date.now()}`,
          issue_id: issueId,
          content: newComment.content,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          author: {
            id: 'current-user',
            name: 'You',
            avatar_url: null,
          },
        };

        return {
          ...old,
          pages: [
            {
              ...old.pages[0],
              comments: [optimisticComment, ...old.pages[0].comments],
            },
            ...old.pages.slice(1),
          ],
        };
      });

      return { previousData };
    },
    onError: (error, _, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['comments', issueId], context.previousData);
      }
      toast.error('댓글 작성 실패', {
        description: error.message,
      });
    },
    onSuccess: () => {
      toast.success('댓글이 작성되었습니다');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', issueId] });
    },
  });
}

export function useUpdateComment(issueId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ commentId, ...data }: UpdateCommentRequest & { commentId: string }) => {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to update comment');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', issueId] });
      toast.success('댓글이 수정되었습니다');
    },
    onError: (error: Error) => {
      toast.error('댓글 수정 실패', {
        description: error.message,
      });
    },
  });
}

export function useDeleteComment(issueId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (commentId: string) => {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to delete comment');
      }

      return response.json();
    },
    onMutate: async (commentId) => {
      await queryClient.cancelQueries({ queryKey: ['comments', issueId] });

      const previousData = queryClient.getQueryData(['comments', issueId]);

      // Optimistic delete
      queryClient.setQueryData(['comments', issueId], (old: any) => {
        if (!old) return old;

        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            comments: page.comments.filter((c: Comment) => c.id !== commentId),
          })),
        };
      });

      return { previousData };
    },
    onError: (error, _, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['comments', issueId], context.previousData);
      }
      toast.error('댓글 삭제 실패', {
        description: error.message,
      });
    },
    onSuccess: () => {
      toast.success('댓글이 삭제되었습니다');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', issueId] });
    },
  });
}
