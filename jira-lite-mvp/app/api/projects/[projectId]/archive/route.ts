import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// PUT /api/projects/[projectId]/archive - 아카이브 토글
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

    const { data: membership } = await supabase
      .from('team_members')
      .select('role')
      .eq('team_id', project.team_id)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    const isOwner = project.owner_id === user.id;
    const isAdmin = membership?.role === 'OWNER' || membership?.role === 'ADMIN';

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: '권한이 없습니다' } },
        { status: 403 }
      );
    }

    const { data: updated, error: updateError } = await supabase
      .from('projects')
      .update({ is_archived: !project.is_archived })
      .eq('id', projectId)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { success: false, error: { code: 'DATABASE_ERROR', message: '아카이브 토글 실패' } },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: { isArchived: updated.is_archived } });
  } catch (error) {
    console.error('PUT /api/projects/[projectId]/archive error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '서버 오류' } },
      { status: 500 }
    );
  }
}
