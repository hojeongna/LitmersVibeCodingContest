import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const createLabelSchema = z.object({
  name: z.string().min(1, '라벨 이름은 필수입니다').max(30, '라벨 이름은 최대 30자까지 입력 가능합니다'),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, '올바른 HEX 색상 코드를 입력해주세요 (예: #FF0000)')
    .default('#3B82F6'),
});

// GET /api/projects/[projectId]/labels - 라벨 목록 조회
export async function GET(request: Request, { params }: { params: Promise<{ projectId: string }> }) {
  try {
    const { projectId } = await params;
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '인증이 필요합니다' } },
        { status: 401 }
      );
    }

    // 팀 멤버십 검증
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
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (!membership) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: '접근 권한이 없습니다' } },
        { status: 403 }
      );
    }

    // 라벨 목록 조회
    const { data: labels, error } = await supabase
      .from('labels')
      .select('*')
      .eq('project_id', projectId)
      .order('name', { ascending: true });

    if (error) {
      return NextResponse.json(
        { success: false, error: { code: 'DATABASE_ERROR', message: '라벨 목록 조회 실패' } },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: labels });
  } catch (error) {
    console.error('GET /api/projects/[projectId]/labels error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '서버 오류' } },
      { status: 500 }
    );
  }
}

// POST /api/projects/[projectId]/labels - 라벨 생성
export async function POST(request: Request, { params }: { params: Promise<{ projectId: string }> }) {
  try {
    const { projectId } = await params;
    const supabase = await createClient();
    const body = await request.json();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '인증이 필요합니다' } },
        { status: 401 }
      );
    }

    // 입력 검증
    const validation = createLabelSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: validation.error.issues[0].message } },
        { status: 400 }
      );
    }

    // 팀 멤버십 검증
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
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (!membership) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: '접근 권한이 없습니다' } },
        { status: 403 }
      );
    }

    // 프로젝트당 라벨 20개 제한 (AC-8: Story 3-3)
    const { count, error: countError } = await supabase
      .from('labels')
      .select('*', { count: 'exact', head: true })
      .eq('project_id', projectId);

    if (countError) {
      return NextResponse.json(
        { success: false, error: { code: 'DATABASE_ERROR', message: '라벨 개수 확인 실패' } },
        { status: 500 }
      );
    }

    if (count !== null && count >= 20) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'LIMIT_EXCEEDED',
            message: '프로젝트당 최대 20개의 라벨만 생성할 수 있습니다',
          },
        },
        { status: 400 }
      );
    }

    // 라벨 생성
    const { data: label, error: insertError } = await supabase
      .from('labels')
      .insert({
        project_id: projectId,
        name: validation.data.name,
        color: validation.data.color,
      })
      .select()
      .single();

    if (insertError) {
      // 중복 이름 에러 처리
      if (insertError.code === '23505') {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'DUPLICATE_NAME',
              message: `라벨 "${validation.data.name}"은(는) 이미 존재합니다`,
            },
          },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { success: false, error: { code: 'DATABASE_ERROR', message: '라벨 생성 실패' } },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: label }, { status: 201 });
  } catch (error) {
    console.error('POST /api/projects/[projectId]/labels error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '서버 오류' } },
      { status: 500 }
    );
  }
}
