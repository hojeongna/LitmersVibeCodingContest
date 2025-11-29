import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
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

// DELETE /api/invites/[inviteId] - Cancel invitation
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ inviteId: string }> }
) {
  try {
    const { inviteId } = await params;
    const supabase = createAdminClient();

    // Check authentication
    const { user, error: authError } = await verifyFirebaseAuth();

    if (authError || !user) {
      return errorResponse("UNAUTHORIZED", "로그인이 필요합니다", 401);
    }

    // Get invitation to verify permissions
    const { data: invite, error: fetchError } = await supabase
      .from("team_invites")
      .select("team_id, email")
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
      .eq("user_id", user.uid)
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
        "초대 취소 권한이 없습니다",
        403
      );
    }

    // Delete invitation
    const { error: deleteError } = await supabase
      .from("team_invites")
      .delete()
      .eq("id", inviteId);

    if (deleteError) {
      console.error("Delete invite error:", deleteError);
      return errorResponse(
        "DELETE_FAILED",
        "초대 취소에 실패했습니다",
        500
      );
    }

    // Note: Invite cancellation is not logged per Story 2.5 AC
    // If needed in future, add 'invite_cancelled' to ActivityAction type

    return NextResponse.json({
      success: true,
      data: { message: "초대가 취소되었습니다" },
    });
  } catch (error) {
    console.error("DELETE /api/invites/[inviteId] error:", error);
    return errorResponse(
      "INTERNAL_ERROR",
      "초대를 취소하는 중 오류가 발생했습니다",
      500
    );
  }
}
