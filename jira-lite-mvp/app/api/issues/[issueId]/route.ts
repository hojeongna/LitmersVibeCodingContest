import { createAdminClient } from '@/lib/supabase/admin';
import { updateIssueSchema } from '@/lib/validations/issue';
import { NextResponse } from 'next/server';

import { verifyFirebaseAuth } from '@/lib/firebase/auth-server';
import { notifyAssignment } from '@/lib/notifications/service';

// GET /api/issues/[issueId] - 이슈 상세 조회
export async function GET(request: Request, { params }: { params: Promise<{ issueId: string }> }) {
  try {
    const { issueId } = await params;
    const supabase = createAdminClient();

    const { user, error: authError } = await verifyFirebaseAuth();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '인증이 필요합니다' } },
        { status: 401 }
      );
    }

    const { data: issue, error } = await supabase
      .from('issues')
      .select(
        `
        *,
        project:projects!issues_project_id_fkey(id, name, team_id),
        status:statuses!issues_status_id_fkey(id, name, color),
        assignee:profiles!issues_assignee_id_fkey(id, name, email, avatar_url),
        owner:profiles!issues_owner_id_fkey(id, name),
        labels:issue_labels(label:labels(id, name, color)),
        subtasks(id, title, is_completed, position, issue_id, created_at)
      `
      )
      .eq('id', issueId)
      .is('deleted_at', null)
      .single();

    if (error) {
      console.error('Issue fetch error:', error);
      return NextResponse.json(
        { success: false, error: { code: 'DATABASE_ERROR', message: error.message } },
        { status: 500 }
      );
    }

    if (!issue) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: '이슈를 찾을 수 없습니다' } },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: issue });
  } catch (error) {
    console.error('GET /api/issues/[issueId] error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '서버 오류' } },
      { status: 500 }
    );
  }
}

// PUT /api/issues/[issueId] - 이슈 수정
export async function PUT(request: Request, { params }: { params: Promise<{ issueId: string }> }) {
  try {
    const { issueId } = await params;
    const supabase = createAdminClient();
    const body = await request.json();

    const { user, error: authError } = await verifyFirebaseAuth();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '인증이 필요합니다' } },
        { status: 401 }
      );
    }

    const validation = updateIssueSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: validation.error.issues[0].message } },
        { status: 400 }
      );
    }

    // 이슈 조회 (히스토리 기록을 위해 이전 값 필요) + 팀 멤버십 검증
    const { data: oldIssue } = await supabase
      .from('issues')
      .select('*, project:projects!inner(*, team:teams!inner(id))')
      .eq('id', issueId)
      .is('deleted_at', null)
      .single();

    if (!oldIssue) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: '이슈를 찾을 수 없습니다' } },
        { status: 404 }
      );
    }

    // 팀 멤버십 검증
    const { data: membership } = await supabase
      .from('team_members')
      .select('role')
      .eq('team_id', oldIssue.project.team.id)
      .eq('user_id', user.uid)
      .single();

    if (!membership) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: '접근 권한이 없습니다' } },
        { status: 403 }
      );
    }

    const { labelIds, ...updateData } = validation.data;

    // 이슈 업데이트
    const { data: updated, error: updateError } = await supabase
      .from('issues')
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', issueId)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { success: false, error: { code: 'DATABASE_ERROR', message: '이슈 수정 실패' } },
        { status: 500 }
      );
    }

    // 히스토리 기록 (AC-10, Task 2.2~2.3: 상태, 담당자, 우선순위, 제목, 마감일 변경 시)
    const historyRecords: Array<{
      issue_id: string;
      changed_by: string;
      field_name: string;
      old_value: string | null;
      new_value: string | null;
    }> = [];

    if (updateData.statusId && updateData.statusId !== oldIssue.status_id) {
      historyRecords.push({
        issue_id: issueId,
        changed_by: user.uid,
        field_name: 'status',
        old_value: oldIssue.status_id,
        new_value: updateData.statusId,
      });
    }

    if (updateData.assigneeId !== undefined && updateData.assigneeId !== oldIssue.assignee_id) {
      historyRecords.push({
        issue_id: issueId,
        changed_by: user.uid,
        field_name: 'assignee',
        old_value: oldIssue.assignee_id,
        new_value: updateData.assigneeId,
      });

      // 알림 발송 (담당자 변경 시)
      if (updateData.assigneeId) {
          notifyAssignment(
              issueId,
              updateData.assigneeId,
              user.uid,
              oldIssue.project.team.id,
              updateData.title || oldIssue.title,
              user.name
          ).catch(console.error)
      }
    }

    if (updateData.priority && updateData.priority !== oldIssue.priority) {
      historyRecords.push({
        issue_id: issueId,
        changed_by: user.uid,
        field_name: 'priority',
        old_value: oldIssue.priority,
        new_value: updateData.priority,
      });
    }

    if (updateData.title && updateData.title !== oldIssue.title) {
      historyRecords.push({
        issue_id: issueId,
        changed_by: user.uid,
        field_name: 'title',
        old_value: oldIssue.title,
        new_value: updateData.title,
      });
    }

    if (updateData.dueDate !== undefined && updateData.dueDate !== oldIssue.due_date) {
      historyRecords.push({
        issue_id: issueId,
        changed_by: user.uid,
        field_name: 'due_date',
        old_value: oldIssue.due_date,
        new_value: updateData.dueDate,
      });
    }

    if (historyRecords.length > 0) {
      await supabase.from('issue_history').insert(historyRecords);
    }

    // 라벨 업데이트 (AC-I08: 이슈당 라벨 5개 제한)
    if (labelIds) {
      if (labelIds.length > 5) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'LIMIT_EXCEEDED',
              message: '이슈당 최대 5개의 라벨만 지정할 수 있습니다',
            },
          },
          { status: 400 }
        );
      }

      await supabase.from('issue_labels').delete().eq('issue_id', issueId);
      if (labelIds.length > 0) {
        await supabase
          .from('issue_labels')
          .insert(labelIds.map((labelId) => ({ issue_id: issueId, label_id: labelId })));
      }
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('PUT /api/issues/[issueId] error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '서버 오류' } },
      { status: 500 }
    );
  }
}

// DELETE /api/issues/[issueId] - 이슈 삭제 (Soft Delete)
export async function DELETE(request: Request, { params }: { params: Promise<{ issueId: string }> }) {
  try {
    const { issueId } = await params;
    const supabase = createAdminClient();

    const { user, error: authError } = await verifyFirebaseAuth();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '인증이 필요합니다' } },
        { status: 401 }
      );
    }

    const { data: issue } = await supabase
      .from('issues')
      .select('*, project:projects!inner(owner_id, team_id)')
      .eq('id', issueId)
      .is('deleted_at', null)
      .single();

    if (!issue) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: '이슈를 찾을 수 없습니다' } },
        { status: 404 }
      );
    }

    // 권한 검증: 이슈 소유자, 프로젝트 소유자, 팀 OWNER/ADMIN
    const { data: membership } = await supabase
      .from('team_members')
      .select('role')
      .eq('team_id', issue.project.team_id)
      .eq('user_id', user.uid)
      .single();

    const isIssueOwner = issue.owner_id === user.uid;
    const isProjectOwner = issue.project.owner_id === user.uid;
    const isAdmin = membership?.role === 'OWNER' || membership?.role === 'ADMIN';

    if (!isIssueOwner && !isProjectOwner && !isAdmin) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: '이슈를 삭제할 권한이 없습니다' } },
        { status: 403 }
      );
    }

    await supabase.from('issues').update({ deleted_at: new Date().toISOString() }).eq('id', issueId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/issues/[issueId] error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '서버 오류' } },
      { status: 500 }
    );
  }
}
