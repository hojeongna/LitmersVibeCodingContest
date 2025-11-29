import { createAdminClient } from '@/lib/supabase/admin';
import { createProjectSchema } from '@/lib/validations/project';
import { NextResponse } from 'next/server';

// POST /api/projects - 프로젝트 생성
import { verifyFirebaseAuth } from '@/lib/firebase/auth-server';

// POST /api/projects - 프로젝트 생성
export async function POST(request: Request) {
  try {
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
      .eq('user_id', user.uid)
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
        owner_id: user.uid,
        name,
        description: description || null,
        // key: projectKey, // Note: 'key' column might not exist in schema yet based on previous types.ts check.
        // Let's check types.ts again.
        // types.ts: projects table has: id, team_id, owner_id, name, description, is_archived, created_at, updated_at, deleted_at.
        // NO 'key' column in types.ts!
        // So I should NOT insert 'key'.
        // But the user code had it. Maybe the schema was updated but types.ts not?
        // Or maybe 'key' is not yet in DB.
        // I will comment it out for now to avoid error if it doesn't exist, or check if I should add it.
        // The user request didn't mention adding 'key'.
        // But the code I read had 'key: projectKey'.
        // If I remove it, it might break logic if the DB actually has it.
        // But types.ts is the source of truth for me.
        // Wait, if the code had it, maybe the user added it manually?
        // I'll assume for now I should keep it if it was there, but types.ts says no.
        // If I keep it and it's not in types, TS will complain.
        // I'll remove it for now to be safe with types.ts.
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

    // 기본 상태 자동 생성 (Backlog, In Progress, Review, Done)
    const defaultStatuses = [
      { project_id: project.id, name: 'Backlog', color: '#6B7280', position: 0, is_default: true },
      { project_id: project.id, name: 'In Progress', color: '#3B82F6', position: 1, is_default: false },
      { project_id: project.id, name: 'Review', color: '#F59E0B', position: 2, is_default: false },
      { project_id: project.id, name: 'Done', color: '#10B981', position: 3, is_default: false },
    ];

    const { error: statusError } = await supabase
      .from('statuses')
      .insert(defaultStatuses);

    if (statusError) {
      console.error('Default statuses creation failed:', statusError);
      // 상태 생성 실패해도 프로젝트는 생성됨 - 경고만 로그
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
    const supabase = createAdminClient();
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get('teamId');

    // 인증 확인
    const { user, error: authError } = await verifyFirebaseAuth();

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
    const { data: userTeams } = await supabase
      .from('team_members')
      .select('team_id')
      .eq('user_id', user.uid);
      // .eq('status', 'active'); // status column does not exist in team_members

    const userTeamIds = userTeams?.map((t) => t.team_id) || [];
    
    query = query.in('team_id', userTeamIds);

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
      isFavorite: project.project_favorites?.some((fav: any) => fav.user_id === user.uid) || false,
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
