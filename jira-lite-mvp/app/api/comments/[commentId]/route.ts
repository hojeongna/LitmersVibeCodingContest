import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

import { verifyFirebaseAuth } from '@/lib/firebase/auth-server';

// PUT /api/comments/[commentId] - 댓글 수정
export async function PUT(request: Request, { params }: { params: Promise<{ commentId: string }> }) {
  try {
    const { commentId } = await params;
    const supabase = createAdminClient();
    const body = await request.json();

    const { user, error: authError } = await verifyFirebaseAuth();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '인증이 필요합니다' } },
        { status: 401 }
      );
    }

    const { content } = body;

    // 입력 검증
    if (!content || typeof content !== 'string' || content.length === 0 || content.length > 1000) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: '댓글 내용은 1-1000자여야 합니다' } },
        { status: 400 }
      );
    }

    // 댓글 조회
    const { data: comment, error: commentError } = await supabase
      .from('comments')
      .select('id, author_id')
      .eq('id', commentId)
      .is('deleted_at', null)
      .single();

    if (commentError || !comment) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: '댓글을 찾을 수 없습니다' } },
        { status: 404 }
      );
    }

    // 본인 댓글만 수정 가능
    if (comment.author_id !== user.uid) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: '본인 댓글만 수정할 수 있습니다' } },
        { status: 403 }
      );
    }

    // 댓글 수정
    const { data: updatedComment, error: updateError } = await supabase
      .from('comments')
      .update({
        content,
        updated_at: new Date().toISOString(),
      })
      .eq('id', commentId)
      .select(
        `
        id,
        issue_id,
        content,
        created_at,
        updated_at,
        author:profiles!comments_author_id_fkey(id, name, avatar_url)
      `
      )
      .single();

    if (updateError) {
      return NextResponse.json(
        { success: false, error: { code: 'DATABASE_ERROR', message: '댓글 수정 실패' } },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { comment: updatedComment },
    });
  } catch (error) {
    console.error('PUT /api/comments/[commentId] error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '서버 오류' } },
      { status: 500 }
    );
  }
}

// DELETE /api/comments/[commentId] - 댓글 삭제
export async function DELETE(request: Request, { params }: { params: Promise<{ commentId: string }> }) {
  try {
    const { commentId } = await params;
    const supabase = createAdminClient();

    const { user, error: authError } = await verifyFirebaseAuth();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '인증이 필요합니다' } },
        { status: 401 }
      );
    }

    // 댓글 및 연관 정보 조회
    const { data: comment, error: commentError } = await supabase
      .from('comments')
      .select('id, author_id, issue:issues!inner(id, owner_id, project:projects!inner(team_id))')
      .eq('id', commentId)
      .is('deleted_at', null)
      .single();

    if (commentError || !comment) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: '댓글을 찾을 수 없습니다' } },
        { status: 404 }
      );
    }

    // 권한 검증: 본인 OR 이슈 reporter OR 팀 OWNER/ADMIN
    let canDelete = comment.author_id === user.uid || comment.issue.owner_id === user.uid;

    if (!canDelete) {
      const { data: membership } = await supabase
        .from('team_members')
        .select('role')
        .eq('team_id', comment.issue.project.team_id)
        .eq('user_id', user.uid)
        .single();

      canDelete = !!(membership && (membership.role === 'OWNER' || membership.role === 'ADMIN'));
    }

    if (!canDelete) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: '댓글 삭제 권한이 없습니다' } },
        { status: 403 }
      );
    }

    // Soft Delete
    const { error: deleteError } = await supabase
      .from('comments')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', commentId);

    if (deleteError) {
      return NextResponse.json(
        { success: false, error: { code: 'DATABASE_ERROR', message: '댓글 삭제 실패' } },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error('DELETE /api/comments/[commentId] error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '서버 오류' } },
      { status: 500 }
    );
  }
}
