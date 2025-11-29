import { createAdminClient } from '@/lib/supabase/admin';
import { verifyFirebaseAuth } from '@/lib/firebase/auth-server';
import { NextResponse } from 'next/server';
import type { KanbanColumn } from '@/types/kanban';

// GET /api/projects/[projectId]/board - 칸반 보드 데이터 조회
export async function GET(request: Request, { params }: { params: Promise<{ projectId: string }> }) {
  try {
    const { projectId } = await params;
    const supabase = createAdminClient();

    const { user, error: authError } = await verifyFirebaseAuth();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '인증이 필요합니다' } },
        { status: 401 }
      );
    }

    // 프로젝트 조회 및 팀 멤버십 검증
    const { data: project } = await supabase
      .from('projects')
      .select('*, team:teams!inner(id)')
      .eq('id', projectId)
      .is('deleted_at', null)
      .single();

    if (!project) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: '프로젝트를 찾을 수 없습니다' } },
        { status: 404 }
      );
    }

    console.log('[Board API] Checking membership:', { teamId: project.team_id, userId: user.uid });

    const { data: membership, error: membershipError } = await supabase
      .from('team_members')
      .select('role')
      .eq('team_id', project.team_id)
      .eq('user_id', user.uid)
      .single();

    if (membershipError || !membership) {
      console.error('[Board API] Membership check failed:', membershipError);
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: '접근 권한이 없습니다' } },
        { status: 403 }
      );
    }

    // 프로젝트의 모든 상태 조회 (position 순)
    let { data: statuses, error: statusError } = await supabase
      .from('statuses')
      .select('*')
      .eq('project_id', projectId)
      .order('position', { ascending: true });

    if (statusError) {
      return NextResponse.json(
        { success: false, error: { code: 'DATABASE_ERROR', message: '상태 목록 조회 실패' } },
        { status: 500 }
      );
    }

    // 상태가 없으면 기본 상태 자동 생성 (기존 프로젝트 호환)
    if (!statuses || statuses.length === 0) {
      const defaultStatuses = [
        { project_id: projectId, name: 'Backlog', color: '#6B7280', position: 0, is_default: true },
        { project_id: projectId, name: 'In Progress', color: '#3B82F6', position: 1, is_default: false },
        { project_id: projectId, name: 'Review', color: '#F59E0B', position: 2, is_default: false },
        { project_id: projectId, name: 'Done', color: '#10B981', position: 3, is_default: false },
      ];

      await supabase.from('statuses').insert(defaultStatuses);

      // 다시 조회
      const { data: createdStatuses } = await supabase
        .from('statuses')
        .select('*')
        .eq('project_id', projectId)
        .order('position', { ascending: true });

      statuses = createdStatuses;
    }

    // 프로젝트의 모든 이슈 조회 (각 상태별로 position 순)
    const { data: issues, error: issuesError } = await supabase
      .from('issues')
      .select(
        `
        id,
        title,
        status_id,
        priority,
        position,
        due_date,
        created_at,
        assignee:profiles!issues_assignee_id_fkey(id, name, avatar_url),
        labels:issue_labels(label:labels(id, name, color))
      `
      )
      .eq('project_id', projectId)
      .is('deleted_at', null)
      .order('position', { ascending: true });

    if (issuesError) {
      return NextResponse.json(
        { success: false, error: { code: 'DATABASE_ERROR', message: '이슈 목록 조회 실패' } },
        { status: 500 }
      );
    }

    // 서브태스크 개수 조회
    const issueIds = issues?.map((issue) => issue.id) || [];
    const { data: subtasks } = await supabase
      .from('subtasks')
      .select('issue_id, is_completed')
      .in('issue_id', issueIds)
      .is('deleted_at', null);

    // 서브태스크 통계 계산
    const subtaskStats = (subtasks || []).reduce((acc, subtask) => {
      if (!acc[subtask.issue_id]) {
        acc[subtask.issue_id] = { total: 0, completed: 0 };
      }
      acc[subtask.issue_id].total++;
      if (subtask.is_completed) {
        acc[subtask.issue_id].completed++;
      }
      return acc;
    }, {} as Record<string, { total: number; completed: number }>);

    // 컬럼별로 이슈 그룹핑
    const columns: KanbanColumn[] = (statuses || []).map((status) => {
      const statusIssues = (issues || [])
        .filter((issue) => issue.status_id === status.id)
        .map((issue) => ({
          id: issue.id,
          title: issue.title,
          status_id: issue.status_id,
          priority: issue.priority as 'HIGH' | 'MEDIUM' | 'LOW',
          position: issue.position,
          assignee: issue.assignee as any,
          labels: issue.labels?.map((l: any) => l.label) || [],
          due_date: issue.due_date,
          created_at: issue.created_at,
          subtask_count: subtaskStats[issue.id]?.total || 0,
          subtask_completed: subtaskStats[issue.id]?.completed || 0,
        }));

      const issueCount = statusIssues.length;
      const isOverWipLimit = status.wip_limit ? issueCount > status.wip_limit : false;

      return {
        status,
        issues: statusIssues,
        issueCount,
        isOverWipLimit,
      };
    });

    return NextResponse.json({ success: true, data: { columns } });
  } catch (error) {
    console.error('GET /api/projects/[projectId]/board error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '서버 오류' } },
      { status: 500 }
    );
  }
}
