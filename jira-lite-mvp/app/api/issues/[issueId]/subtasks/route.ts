import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const createSubtaskSchema = z.object({
  title: z.string().min(1, '제목은 필수입니다').max(200, '제목은 최대 200자까지 입력 가능합니다'),
});

import { verifyFirebaseAuth } from '@/lib/firebase/auth-server';

// POST /api/issues/[issueId]/subtasks - 서브태스크 생성
export async function POST(request: Request, { params }: { params: Promise<{ issueId: string }> }) {
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

    const validation = createSubtaskSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: validation.error.issues[0].message } },
        { status: 400 }
      );
    }

    // 서브태스크 개수 제한 (AC-I18: 이슈당 20개)
    const { count } = await supabase
      .from('subtasks')
      .select('*', { count: 'exact', head: true })
      .eq('issue_id', issueId);

    if (count !== null && count >= 20) {
      return NextResponse.json(
        { success: false, error: { code: 'LIMIT_EXCEEDED', message: '이슈당 최대 20개의 서브태스크만 생성할 수 있습니다' } },
        { status: 400 }
      );
    }

    const position = (count || 0) + 1;

    const { data: subtask, error: insertError } = await supabase
      .from('subtasks')
      .insert({
        issue_id: issueId,
        title: validation.data.title,
        position,
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json(
        { success: false, error: { code: 'DATABASE_ERROR', message: '서브태스크 생성 실패' } },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: subtask }, { status: 201 });
  } catch (error) {
    console.error('POST /api/issues/[issueId]/subtasks error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '서버 오류' } },
      { status: 500 }
    );
  }
}
