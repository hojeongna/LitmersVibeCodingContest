import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

import { verifyFirebaseAuth } from '@/lib/firebase/auth-server';

// GET /api/projects/[projectId]/statuses - 프로젝트 상태 목록 조회
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

    const { data: membership } = await supabase
      .from('team_members')
      .select('role')
      .eq('team_id', project.team_id)
      .eq('user_id', user.uid)
      .single();

    if (!membership) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: '접근 권한이 없습니다' } },
        { status: 403 }
      );
    }

    // 프로젝트의 모든 상태 조회 (position 순)
    const { data: statuses, error: statusError } = await supabase
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

    return NextResponse.json({ success: true, data: { statuses } });
  } catch (error) {
    console.error('GET /api/projects/[projectId]/statuses error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '서버 오류' } },
      { status: 500 }
    );
  }
}

// POST /api/projects/[projectId]/statuses - 새로운 상태 생성
export async function POST(request: Request, { params }: { params: Promise<{ projectId: string }> }) {
  try {
    const { projectId } = await params;
    const supabase = createAdminClient();
    const body = await request.json();

    const { user, error: authError } = await verifyFirebaseAuth();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '인증이 필요합니다' } },
        { status: 401 }
      );
    }

    const { name, color, wip_limit } = body;

    // 입력 검증
    if (!name || typeof name !== 'string' || name.length === 0 || name.length > 30) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: '상태 이름은 1-30자여야 합니다' } },
        { status: 400 }
      );
    }

    if (!color || !/^#[0-9A-Fa-f]{6}$/.test(color)) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: '색상은 HEX 형식이어야 합니다 (#XXXXXX)' } },
        { status: 400 }
      );
    }

    if (wip_limit !== undefined && wip_limit !== null && (typeof wip_limit !== 'number' || wip_limit < 1 || wip_limit > 50)) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'WIP Limit은 1-50 사이여야 합니다' } },
        { status: 400 }
      );
    }

    // 프로젝트 조회 및 팀 멤버십 검증
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

    // 팀 멤버십 및 권한 검증 (OWNER/ADMIN만)
    const { data: membership } = await supabase
      .from('team_members')
      .select('role')
      .eq('team_id', project.team_id)
      .eq('user_id', user.uid)
      .single();

    if (!membership || (membership.role !== 'OWNER' && membership.role !== 'ADMIN')) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'OWNER 또는 ADMIN 권한이 필요합니다' } },
        { status: 403 }
      );
    }

    // 기존 상태 개수 확인 (최대 9개: 기본 4개 + 커스텀 5개)
    const { count, error: countError } = await supabase
      .from('statuses')
      .select('*', { count: 'exact', head: true })
      .eq('project_id', projectId);

    if (countError || count === null || count >= 9) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: '상태는 최대 9개까지 생성할 수 있습니다' } },
        { status: 400 }
      );
    }

    // 다음 position 계산
    const { data: lastStatus } = await supabase
      .from('statuses')
      .select('position')
      .eq('project_id', projectId)
      .order('position', { ascending: false })
      .limit(1)
      .single();

    const newPosition = lastStatus ? lastStatus.position + 1 : 0;

    // 상태 생성
    const { data: newStatus, error: createError } = await supabase
      .from('statuses')
      .insert({
        project_id: projectId,
        name,
        color,
        position: newPosition,
        wip_limit: wip_limit || null,
        is_default: false,
      })
      .select()
      .single();

    if (createError) {
      return NextResponse.json(
        { success: false, error: { code: 'DATABASE_ERROR', message: '상태 생성 실패' } },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { status: newStatus },
    });
  } catch (error) {
    console.error('POST /api/projects/[projectId]/statuses error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '서버 오류' } },
      { status: 500 }
    );
  }
}
