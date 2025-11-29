'use client';

import { useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface RealtimeKanbanOptions {
  projectId: string;
  enabled?: boolean;
}

/**
 * 칸반 보드 실시간 동기화 훅
 * - 다른 사용자가 이슈를 이동/생성/수정/삭제하면 자동으로 반영
 * - Supabase Realtime postgres_changes 사용
 */
export function useRealtimeKanban({ projectId, enabled = true }: RealtimeKanbanOptions) {
  const queryClient = useQueryClient();
  const supabase = createClient();

  const invalidateKanbanQueries = useCallback(() => {
    // 칸반 보드 관련 쿼리 무효화
    queryClient.invalidateQueries({ queryKey: ['kanban', projectId] });
    queryClient.invalidateQueries({ queryKey: ['issues', projectId] });
  }, [queryClient, projectId]);

  useEffect(() => {
    if (!enabled || !projectId) return;

    // 이슈 변경 구독
    const issuesChannel = supabase
      .channel(`kanban-issues-${projectId}`)
      .on(
        'postgres_changes',
        {
          event: '*', // INSERT, UPDATE, DELETE 모두 구독
          schema: 'public',
          table: 'issues',
          filter: `project_id=eq.${projectId}`,
        },
        (payload) => {
          console.log('[Realtime] Issue change:', payload.eventType, payload);

          // 다른 사용자의 변경사항일 때만 반영 (자신의 변경은 optimistic update로 이미 반영됨)
          // payload.new 또는 payload.old의 updated_at을 확인하여 최근 변경인지 체크
          invalidateKanbanQueries();

          // 이벤트 타입에 따른 토스트 메시지
          switch (payload.eventType) {
            case 'INSERT':
              toast.info('새 이슈가 추가되었습니다', { duration: 2000 });
              break;
            case 'UPDATE':
              // 이슈 이동 또는 수정
              toast.info('이슈가 업데이트되었습니다', { duration: 2000 });
              break;
            case 'DELETE':
              toast.info('이슈가 삭제되었습니다', { duration: 2000 });
              break;
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('[Realtime] Subscribed to kanban issues for project:', projectId);
        }
      });

    // 이슈 상태(컬럼) 변경 구독
    const statusesChannel = supabase
      .channel(`kanban-statuses-${projectId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'issue_statuses',
          filter: `project_id=eq.${projectId}`,
        },
        (payload) => {
          console.log('[Realtime] Status change:', payload.eventType, payload);
          invalidateKanbanQueries();

          if (payload.eventType === 'INSERT') {
            toast.info('새 컬럼이 추가되었습니다', { duration: 2000 });
          } else if (payload.eventType === 'DELETE') {
            toast.info('컬럼이 삭제되었습니다', { duration: 2000 });
          }
        }
      )
      .subscribe();

    // 댓글 변경 구독 (이슈 상세에서 사용)
    const commentsChannel = supabase
      .channel(`kanban-comments-${projectId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'comments',
        },
        (payload) => {
          console.log('[Realtime] New comment:', payload);
          // 해당 이슈의 댓글 쿼리 무효화
          const issueId = (payload.new as { issue_id?: string })?.issue_id;
          if (issueId) {
            queryClient.invalidateQueries({ queryKey: ['comments', issueId] });
          }
        }
      )
      .subscribe();

    // Cleanup
    return () => {
      console.log('[Realtime] Unsubscribing from kanban channels');
      supabase.removeChannel(issuesChannel);
      supabase.removeChannel(statusesChannel);
      supabase.removeChannel(commentsChannel);
    };
  }, [projectId, enabled, supabase, invalidateKanbanQueries, queryClient]);

  return {
    // 수동 새로고침 함수
    refresh: invalidateKanbanQueries,
  };
}
