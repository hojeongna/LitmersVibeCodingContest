import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { verifyFirebaseAuth } from '@/lib/firebase/auth-server';

const updateLabelSchema = z.object({
  name: z.string().min(1, '라벨 이름은 필수입니다').max(30, '라벨 이름은 최대 30자까지 입력 가능합니다').optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, '올바른 HEX 색상 코드를 입력해주세요 (예: #FF0000)').optional(),
});

// PUT /api/labels/[labelId] - 라벨 수정
export async function PUT(request: Request, { params }: { params: Promise<{ labelId: string }> }) {
  try {
    const { labelId } = await params;
    const supabase = createAdminClient();
    const body = await request.json();

    const { user, error: authError } = await verifyFirebaseAuth();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '인증이 필요합니다' } },
        { status: 401 }
      );
    }

    // 입력 검증
    const validation = updateLabelSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: validation.error.issues[0].message } },
        { status: 400 }
      );
    }

    // 라벨 조회 및 팀 멤버십 검증
    const { data: label } = await supabase
      .from('labels')
      .select('*, project:projects!inner(*, team:teams!inner(id))')
      .eq('id', labelId)
      .single();

    if (!label) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: '라벨을 찾을 수 없습니다' } },
        { status: 404 }
      );
    }

    const { data: membership } = await supabase
      .from('team_members')
      .select('role')
      .eq('team_id', label.project.team.id)
      .eq('user_id', user.uid)
      .single();

    if (!membership) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: '접근 권한이 없습니다' } },
        { status: 403 }
      );
    }

    // 라벨 수정
    const { data: updated, error: updateError } = await supabase
      .from('labels')
      .update(validation.data)
      .eq('id', labelId)
      .select()
      .single();

    if (updateError) {
      // 중복 이름 에러 처리
      if (updateError.code === '23505') {
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
        { success: false, error: { code: 'DATABASE_ERROR', message: '라벨 수정 실패' } },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('PUT /api/labels/[labelId] error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '서버 오류' } },
      { status: 500 }
    );
  }
}

// DELETE /api/labels/[labelId] - 라벨 삭제
export async function DELETE(request: Request, { params }: { params: Promise<{ labelId: string }> }) {
  try {
    const { labelId } = await params;
    const supabase = createAdminClient();

    const { user, error: authError } = await verifyFirebaseAuth();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '인증이 필요합니다' } },
        { status: 401 }
      );
    }

    // 라벨 조회 및 팀 멤버십 검증
    const { data: label } = await supabase
      .from('labels')
      .select('*, project:projects!inner(*, team:teams!inner(id))')
      .eq('id', labelId)
      .single();

    if (!label) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: '라벨을 찾을 수 없습니다' } },
        { status: 404 }
      );
    }

    const { data: membership } = await supabase
      .from('team_members')
      .select('role')
      .eq('team_id', label.project.team.id)
      .eq('user_id', user.uid)
      .single();

    if (!membership) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: '접근 권한이 없습니다' } },
        { status: 403 }
      );
    }

    // 라벨 삭제 (issue_labels는 CASCADE로 자동 삭제됨)
    const { error: deleteError } = await supabase.from('labels').delete().eq('id', labelId);

    if (deleteError) {
      return NextResponse.json(
        { success: false, error: { code: 'DATABASE_ERROR', message: '라벨 삭제 실패' } },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/labels/[labelId] error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '서버 오류' } },
      { status: 500 }
    );
  }
}
