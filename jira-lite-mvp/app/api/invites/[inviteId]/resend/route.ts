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

// POST /api/invites/[inviteId]/resend - Resend invitation
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ inviteId: string }> }
) {
  try {
    const { inviteId } = await params;
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return errorResponse("UNAUTHORIZED", "로그인이 필요합니다", 401);
    }

    // Get invitation to verify permissions and get details
    const { data: invite, error: fetchError } = await supabase
      .from("team_invites")
      .select("*")
      .eq("id", inviteId)
      .single();

    if (fetchError || !invite) {
      return errorResponse(
        "INVITE_NOT_FOUND",
        "초대를 찾을 수 없습니다",
        404
      );
    }

    // Check user's role in the team (must be OWNER or ADMIN)
    const { data: membership, error: memberError } = await supabase
      .from("team_members")
      .select("role")
      .eq("team_id", invite.team_id)
      .eq("user_id", user.id)
      .is("deleted_at", null)
      .single();

    if (memberError || !membership) {
      return errorResponse(
        "TEAM_NOT_FOUND",
        "팀을 찾을 수 없거나 접근 권한이 없습니다",
        404
      );
    }

    if (membership.role !== "OWNER" && membership.role !== "ADMIN") {
      return errorResponse(
        "INSUFFICIENT_PERMISSION",
        "초대 재발송 권한이 없습니다",
        403
      );
    }

    // Update expiration date (7 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const { data: updatedInvite, error: updateError } = await supabase
      .from("team_invites")
      .update({
        expires_at: expiresAt.toISOString(),
      })
      .eq("id", inviteId)
      .select()
      .single();

    if (updateError || !updatedInvite) {
      console.error("Update invite error:", updateError);
      return errorResponse(
        "UPDATE_FAILED",
        "초대 재발송에 실패했습니다",
        500
      );
    }

    // TODO: Resend invitation email via Resend
    // await sendTeamInvite({ email: invite.email, token: invite.token, teamId: invite.team_id });

    // TODO: Log activity
    // await ActivityLogService.log('invite_resent', { teamId: invite.team_id, email: invite.email });

    return NextResponse.json({
      success: true,
      data: updatedInvite,
    });
  } catch (error) {
    console.error("POST /api/invites/[inviteId]/resend error:", error);
    return errorResponse(
      "INTERNAL_ERROR",
      "초대를 재발송하는 중 오류가 발생했습니다",
      500
    );
  }
}
