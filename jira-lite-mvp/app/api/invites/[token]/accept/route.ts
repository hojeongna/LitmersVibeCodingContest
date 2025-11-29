import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Standard error response
function errorResponse(
  code: string,
  message: string,
  status: number = 400
) {
  return NextResponse.json(
    {
      success: false,
      error: { code, message },
    },
    { status }
  );
}

// POST /api/invites/[token]/accept - Accept invitation
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return errorResponse("UNAUTHORIZED", "로그인이 필요합니다", 401);
    }

    // Get invitation by token
    const { data: invite, error: fetchError } = await supabase
      .from("team_invites")
      .select("*")
      .eq("token", token)
      .single();

    if (fetchError || !invite) {
      return errorResponse(
        "INVITE_NOT_FOUND",
        "초대를 찾을 수 없습니다",
        404
      );
    }

    // Check if invitation is expired
    const now = new Date();
    const expiresAt = new Date(invite.expires_at);

    if (now > expiresAt) {
      return errorResponse(
        "INVITE_EXPIRED",
        "초대가 만료되었습니다",
        400
      );
    }

    // Check if user's email matches invitation email
    if (user.email?.toLowerCase() !== invite.email.toLowerCase()) {
      return errorResponse(
        "EMAIL_MISMATCH",
        "초대된 이메일과 현재 로그인한 이메일이 일치하지 않습니다",
        403
      );
    }

    // Check if user is already a team member
    const { data: existingMember } = await supabase
      .from("team_members")
      .select("id")
      .eq("team_id", invite.team_id)
      .eq("user_id", user.id)
      .is("deleted_at", null)
      .single();

    if (existingMember) {
      // Delete the invite since user is already a member
      await supabase.from("team_invites").delete().eq("id", invite.id);

      return errorResponse(
        "ALREADY_MEMBER",
        "이미 팀 멤버입니다",
        400
      );
    }

    // Add user as team member (default role: MEMBER)
    const { data: newMember, error: createError } = await supabase
      .from("team_members")
      .insert({
        team_id: invite.team_id,
        user_id: user.id,
        role: "MEMBER",
      })
      .select()
      .single();

    if (createError || !newMember) {
      console.error("Create team member error:", createError);
      return errorResponse(
        "CREATE_FAILED",
        "팀 멤버 추가에 실패했습니다",
        500
      );
    }

    // Delete the invitation
    const { error: deleteError } = await supabase
      .from("team_invites")
      .delete()
      .eq("id", invite.id);

    if (deleteError) {
      console.error("Delete invite error:", deleteError);
      // Don't return error here - member was already added
      // This is a non-critical error
    }

    // TODO: Log activity
    // await ActivityLogService.log('member_joined', { teamId: invite.team_id, userId: user.id, role: invite.role });

    return NextResponse.json({
      success: true,
      data: {
        member: newMember,
        teamId: invite.team_id,
      },
    });
  } catch (error) {
    console.error("POST /api/invites/[token]/accept error:", error);
    return errorResponse(
      "INTERNAL_ERROR",
      "초대를 수락하는 중 오류가 발생했습니다",
      500
    );
  }
}
