'use client';

import { MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useComments } from '@/hooks/use-comments';
import { CommentInput } from './comment-input';
import { CommentItem } from './comment-item';
import { CommentSummary } from '@/components/ai/comment-summary';

interface CommentSectionProps {
  issueId: string;
  currentUser?: {
    id: string;
    name: string;
    avatar_url: string | null;
  };
  issueReporterId?: string;
  userRole?: 'OWNER' | 'ADMIN' | 'MEMBER';
}

export function CommentSection({ issueId, currentUser, issueReporterId, userRole }: CommentSectionProps) {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useComments(issueId);

  const allComments = data?.pages.flatMap((page) => page.comments) || [];
  const totalCount = data?.pages[0]?.pagination.total || 0;

  if (isLoading) {
    return (
      <div className="space-y-4 p-6">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          <h3 className="font-semibold">댓글</h3>
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-16 w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4 border-t p-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
        <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">댓글 ({totalCount})</h3>
      </div>

      {/* AI Comment Summary */}
      <CommentSummary issueId={issueId} commentCount={totalCount} className="mt-0" />

      {/* Comment List */}
      <div className="space-y-1 divide-y divide-zinc-200 dark:divide-zinc-800">
        {allComments.length === 0 ? (
          <div className="py-8 text-center text-sm text-zinc-500">
            아직 댓글이 없습니다. 첫 댓글을 작성해보세요.
          </div>
        ) : (
          <>
            {allComments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                issueId={issueId}
                currentUserId={currentUser?.id}
                issueReporterId={issueReporterId}
                userRole={userRole}
              />
            ))}

            {/* Load More */}
            {hasNextPage && (
              <div className="pt-4 text-center">
                <Button variant="outline" size="sm" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
                  {isFetchingNextPage ? '로딩 중...' : '더 보기'}
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Comment Input */}
      <CommentInput issueId={issueId} currentUser={currentUser} />
    </div>
  );
}
