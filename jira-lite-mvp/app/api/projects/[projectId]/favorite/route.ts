import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// PUT /api/projects/[projectId]/favorite - 즐겨찾기 토글
export async function PUT(request: Request, { params }: { params: Promise<{ projectId: string }> }) {
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

    // 즐겨찾기 존재 확인
    const { data: existing } = await supabase
      .from('project_favorites')
      .select()
      .eq('user_id', user.id)
      .eq('project_id', projectId)
      .single();

    if (existing) {
      // 제거
      await supabase.from('project_favorites').delete().eq('user_id', user.id).eq('project_id', projectId);
      return NextResponse.json({ success: true, data: { isFavorite: false } });
    } else {
      // 추가
      await supabase.from('project_favorites').insert({ user_id: user.id, project_id: projectId });
      return NextResponse.json({ success: true, data: { isFavorite: true } });
    }
  } catch (error) {
    console.error('PUT /api/projects/[projectId]/favorite error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '서버 오류' } },
      { status: 500 }
    );
  }
}
