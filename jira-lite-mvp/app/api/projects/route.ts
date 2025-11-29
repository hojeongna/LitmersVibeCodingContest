import { createClient } from '@/lib/supabase/server';
import { createProjectSchema } from '@/lib/validations/project';
import { NextResponse } from 'next/server';

// POST /api/projects - 프로젝트 생성
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    // 인증 확인
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
    const validation = createProjectSchema.safeParse(body);
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

    const { name, description, teamId, key } = validation.data;

    // 팀 멤버십 검증 (FR-070)
    const { data: membership, error: membershipError } = await supabase
      .from('team_members')
      .select('role')
      .eq('team_id', teamId)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (membershipError || !membership) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: '팀 멤버만 프로젝트를 생성할 수 있습니다' } },
        { status: 403 }
      );
    }

    // 팀당 프로젝트 개수 제한 확인 (AC-2: 최대 15개)
    const { count, error: countError } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('team_id', teamId)
      .is('deleted_at', null);

    if (countError) {
      return NextResponse.json(
        { success: false, error: { code: 'DATABASE_ERROR', message: '프로젝트 개수 확인 실패' } },
        { status: 500 }
      );
    }

    if (count !== null && count >= 15) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'LIMIT_EXCEEDED',
            message: '팀당 최대 15개의 프로젝트만 생성할 수 있습니다',
          },
        },
        { status: 400 }
      );
    }

    // 프로젝트 키 자동 생성 (제공되지 않은 경우)
    let projectKey = key;
    if (!projectKey) {
      // 프로젝트 이름에서 첫 글자들로 키 생성
      const words = name.split(/\s+/).filter(Boolean);
      projectKey = words
        .slice(0, 3)
        .map((word) => word[0].toUpperCase())
        .join('');

      // 최소 2자 보장
      if (projectKey.length < 2) {
        projectKey = name.slice(0, 2).toUpperCase().replace(/[^A-Z]/g, 'PR');
      }
    }

    // 프로젝트 생성
    const { data: project, error: insertError } = await supabase
      .from('projects')
      .insert({
        team_id: teamId,
        owner_id: user.id,
        name,
        description: description || null,
        key: projectKey,
      })
      .select()
      .single();

    if (insertError) {
      // 프로젝트 키 중복 에러 처리
      if (insertError.code === '23505') {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'DUPLICATE_KEY',
              message: `프로젝트 키 "${projectKey}"는 이미 사용 중입니다`,
            },
          },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { success: false, error: { code: 'DATABASE_ERROR', message: '프로젝트 생성 실패' } },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: project }, { status: 201 });
  } catch (error) {
    console.error('POST /api/projects error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다' } },
      { status: 500 }
    );
  }
}

// GET /api/projects - 프로젝트 목록 조회
export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get('teamId');

    // 인증 확인
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

    let query = supabase
      .from('projects')
      .select(
        `
        *,
        team:teams!inner(id, name),
        project_favorites!left(user_id),
        issues:issues(count)
      `,
        { count: 'exact' }
      )
      .is('deleted_at', null);

    // 팀 필터링
    if (teamId) {
      query = query.eq('team_id', teamId);
    }

    // 팀 멤버십 검증 (RLS로도 필터링되지만 명시적 체크)
    query = query.in(
      'team_id',
      supabase
        .from('team_members')
        .select('team_id')
        .eq('user_id', user.id)
        .eq('status', 'active')
    );

    const { data: projects, error } = await query;

    if (error) {
      return NextResponse.json(
        { success: false, error: { code: 'DATABASE_ERROR', message: '프로젝트 목록 조회 실패' } },
        { status: 500 }
      );
    }

    // 즐겨찾기 여부 추가 & 정렬 (AC-4: 즐겨찾기 우선, 생성일 역순)
    const projectsWithFavorites = projects.map((project: any) => ({
      ...project,
      isFavorite: project.project_favorites?.some((fav: any) => fav.user_id === user.id) || false,
      issueCount: project.issues?.[0]?.count || 0,
    }));

    // 정렬
    projectsWithFavorites.sort((a: any, b: any) => {
      // 즐겨찾기 우선
      if (a.isFavorite && !b.isFavorite) return -1;
      if (!a.isFavorite && b.isFavorite) return 1;
      // 생성일 역순
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    return NextResponse.json({ success: true, data: projectsWithFavorites });
  } catch (error) {
    console.error('GET /api/projects error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다' } },
      { status: 500 }
    );
  }
}
