import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { logActivity } from "@/lib/services/activity";
import { verifyFirebaseAuth } from "@/lib/firebase/auth-server";

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

// POST /api/invites/accept/[token] - Accept invitation
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const supabase = createAdminClient();

    // Check authentication
    const { user, error: authError } = await verifyFirebaseAuth();

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
      .eq("user_id", user.uid)
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
        user_id: user.uid,
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

    // Log activity
    await logActivity(
      invite.team_id,
      user.uid,
      "member_joined",
      "member",
      user.uid,
      { email: invite.email }
    );

    return NextResponse.json({
      success: true,
      data: {
        member: newMember,
        teamId: invite.team_id,
      },
    });
  } catch (error) {
    console.error("POST /api/invites/accept/[token] error:", error);
    return errorResponse(
      "INTERNAL_ERROR",
      "초대를 수락하는 중 오류가 발생했습니다",
      500
    );
  }
}
