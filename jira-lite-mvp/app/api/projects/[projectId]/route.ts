import { createAdminClient } from '@/lib/supabase/admin';
import { updateProjectSchema } from '@/lib/validations/project';
import { NextResponse } from 'next/server';

import { verifyFirebaseAuth } from '@/lib/firebase/auth-server';

// GET /api/projects/[projectId] - 프로젝트 상세 조회
export async function GET(request: Request, { params }: { params: Promise<{ projectId: string }> }) {
  try {
    const { projectId } = await params;
    const supabase = createAdminClient();

    // 인증 확인
    const { user, error: authError } = await verifyFirebaseAuth();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '인증이 필요합니다' } },
        { status: 401 }
      );
    }

    // 프로젝트 조회 (팀 멤버십 검증 포함)
    const { data: project, error } = await supabase
      .from('projects')
      .select(
        `
        *,
        team:teams!inner(id, name),
        owner:profiles!projects_owner_id_fkey(id, name, email, avatar_url),
        project_favorites!left(user_id)
      `
      )
      .eq('id', projectId)
      .is('deleted_at', null)
      .single();

    if (error || !project) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: '프로젝트를 찾을 수 없습니다' } },
        { status: 404 }
      );
    }

    // 팀 멤버십 검증
    const { data: membership, error: membershipError } = await supabase
      .from('team_members')
      .select('role')
      .eq('team_id', project.team_id)
      .eq('user_id', user.uid)
      .single();

    if (membershipError || !membership) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: '접근 권한이 없습니다' } },
        { status: 403 }
      );
    }

    // 이슈 통계 조회 (AC-5: 상태별 개수)
    const { data: issueStats, error: statsError } = await supabase
      .from('issues')
      .select('status_id, statuses(name)')
      .eq('project_id', projectId)
      .is('deleted_at', null);

    if (statsError) {
      console.error('Issue stats error:', statsError);
    }

    // 상태별 집계
    const statusCounts: Record<string, number> = {};
    issueStats?.forEach((issue: any) => {
      const statusName = issue.statuses?.name || 'Unknown';
      statusCounts[statusName] = (statusCounts[statusName] || 0) + 1;
    });

    const projectData = {
      ...project,
      isFavorite: project.project_favorites?.some((fav: any) => fav.user_id === user.uid) || false,
      issueStats: statusCounts,
    };

    return NextResponse.json({ success: true, data: projectData });
  } catch (error) {
    console.error('GET /api/projects/[projectId] error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다' } },
      { status: 500 }
    );
  }
}

// PUT /api/projects/[projectId] - 프로젝트 수정
export async function PUT(request: Request, { params }: { params: Promise<{ projectId: string }> }) {
  try {
    const { projectId } = await params;
    const supabase = createAdminClient();
    const body = await request.json();

    // 인증 확인
    const { user, error: authError } = await verifyFirebaseAuth();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '인증이 필요합니다' } },
        { status: 401 }
      );
    }

    // 입력 검증
    const validation = updateProjectSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: validation.error.issues[0].message,
          },
        },
        { status: 400 }
      );
    }

    // 프로젝트 조회
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*, team:teams!inner(id)')
      .eq('id', projectId)
      .is('deleted_at', null)
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: '프로젝트를 찾을 수 없습니다' } },
        { status: 404 }
      );
    }

    // 권한 검증 (AC-6: OWNER, ADMIN, 프로젝트 소유자)
    const { data: membership, error: membershipError } = await supabase
      .from('team_members')
      .select('role')
      .eq('team_id', project.team_id)
      .eq('user_id', user.uid)
      .single();

    if (membershipError || !membership) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: '접근 권한이 없습니다' } },
        { status: 403 }
      );
    }

    const isOwner = project.owner_id === user.uid;
    const isAdmin = membership.role === 'OWNER' || membership.role === 'ADMIN';

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: '프로젝트를 수정할 권한이 없습니다',
          },
        },
        { status: 403 }
      );
    }

    // 프로젝트 수정
    const { data: updatedProject, error: updateError } = await supabase
      .from('projects')
      .update({
        ...validation.data,
        updated_at: new Date().toISOString(),
      })
      .eq('id', projectId)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { success: false, error: { code: 'DATABASE_ERROR', message: '프로젝트 수정 실패' } },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: updatedProject });
  } catch (error) {
    console.error('PUT /api/projects/[projectId] error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다' } },
      { status: 500 }
    );
  }
}

// DELETE /api/projects/[projectId] - 프로젝트 삭제 (Soft Delete)
export async function DELETE(request: Request, { params }: { params: Promise<{ projectId: string }> }) {
  try {
    const { projectId } = await params;
    const supabase = createAdminClient();

    // 인증 확인
    const { user, error: authError } = await verifyFirebaseAuth();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '인증이 필요합니다' } },
        { status: 401 }
      );
    }

    // 프로젝트 조회
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*, team:teams!inner(id)')
      .eq('id', projectId)
      .is('deleted_at', null)
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: '프로젝트를 찾을 수 없습니다' } },
        { status: 404 }
      );
    }

    // 권한 검증 (AC-7: OWNER, ADMIN, 프로젝트 소유자)
    const { data: membership, error: membershipError } = await supabase
      .from('team_members')
      .select('role')
      .eq('team_id', project.team_id)
      .eq('user_id', user.uid)
      .single();

    if (membershipError || !membership) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: '접근 권한이 없습니다' } },
        { status: 403 }
      );
    }

    const isOwner = project.owner_id === user.uid;
    const isAdmin = membership.role === 'OWNER' || membership.role === 'ADMIN';

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: '프로젝트를 삭제할 권한이 없습니다',
          },
        },
        { status: 403 }
      );
    }

    // Soft Delete: 프로젝트와 하위 이슈 삭제 (AC-8)
    const now = new Date().toISOString();

    // 프로젝트 삭제
    const { error: deleteProjectError } = await supabase
      .from('projects')
      .update({ deleted_at: now })
      .eq('id', projectId);

    if (deleteProjectError) {
      return NextResponse.json(
        { success: false, error: { code: 'DATABASE_ERROR', message: '프로젝트 삭제 실패' } },
        { status: 500 }
      );
    }

    // 하위 이슈 삭제
    const { error: deleteIssuesError } = await supabase
      .from('issues')
      .update({ deleted_at: now })
      .eq('project_id', projectId);

    if (deleteIssuesError) {
      console.error('Delete issues error:', deleteIssuesError);
      // 이슈 삭제 실패해도 프로젝트는 삭제됨 (RLS로 필터링됨)
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/projects/[projectId] error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다' } },
      { status: 500 }
    );
  }
}
