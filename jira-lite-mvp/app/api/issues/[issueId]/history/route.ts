import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// GET /api/issues/[issueId]/history - 이슈 히스토리 조회
export async function GET(request: Request, { params }: { params: Promise<{ issueId: string }> }) {
  try {
    const { issueId } = await params;
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

    const { data: history, error } = await supabase
      .from('issue_history')
      .select(
        `
        *,
        changedBy:profiles!issue_history_changed_by_fkey(id, name, avatar_url)
      `
      )
      .eq('issue_id', issueId)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { success: false, error: { code: 'DATABASE_ERROR', message: '히스토리 조회 실패' } },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: history });
  } catch (error) {
    console.error('GET /api/issues/[issueId]/history error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '서버 오류' } },
      { status: 500 }
    );
  }
}
