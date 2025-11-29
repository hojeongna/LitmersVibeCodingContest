import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/services/activity";
import { z } from "zod";

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

// Validation schema for role update
const updateRoleSchema = z.object({
  role: z.enum(["OWNER", "ADMIN", "MEMBER"], {
    errorMap: () => ({ message: "역할은 OWNER, ADMIN 또는 MEMBER여야 합니다" }),
  }),
});

// PUT /api/teams/[teamId]/members/[userId] - Update member role
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string; userId: string }> }
) {
  try {
    const { teamId, userId } = await params;
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return errorResponse("UNAUTHORIZED", "로그인이 필요합니다", 401);
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = updateRoleSchema.safeParse(body);

    if (!validation.success) {
      const message = validation.error.issues[0]?.message || "입력값이 유효하지 않습니다";
      return errorResponse("VALIDATION_ERROR", message, 400);
    }

    const { role: newRole } = validation.data;

    // Check current user's role (must be OWNER)
    const { data: currentUserMembership, error: currentUserError } = await supabase
      .from("team_members")
      .select("role")
      .eq("team_id", teamId)
      .eq("user_id", user.id)
      .is("deleted_at", null)
      .single();

    if (currentUserError || !currentUserMembership) {
      return errorResponse(
        "TEAM_NOT_FOUND",
        "팀을 찾을 수 없거나 접근 권한이 없습니다",
        404
      );
    }

    if (currentUserMembership.role !== "OWNER") {
      return errorResponse(
        "INSUFFICIENT_PERMISSION",
        "역할 변경은 OWNER만 가능합니다",
        403
      );
    }

    // Get target member
    const { data: targetMember, error: targetError } = await supabase
      .from("team_members")
      .select("role, user_id")
      .eq("team_id", teamId)
      .eq("user_id", userId)
      .is("deleted_at", null)
      .single();

    if (targetError || !targetMember) {
      return errorResponse(
        "MEMBER_NOT_FOUND",
        "멤버를 찾을 수 없습니다",
        404
      );
    }

    // Handle ownership transfer
    if (newRole === "OWNER") {
      // Get team to verify current owner
      const { data: team } = await supabase
        .from("teams")
        .select("owner_id")
        .eq("id", teamId)
        .single();

      if (!team || team.owner_id !== user.id) {
        return errorResponse(
          "INSUFFICIENT_PERMISSION",
          "소유권 이전은 현재 OWNER만 가능합니다",
          403
        );
      }

      // Ownership transfer: demote current OWNER to ADMIN
      const { error: demoteError } = await supabase
        .from("team_members")
        .update({ role: "ADMIN" })
        .eq("team_id", teamId)
        .eq("user_id", user.id);

      if (demoteError) {
        console.error("Demote current owner error:", demoteError);
        return errorResponse(
          "UPDATE_FAILED",
          "소유권 이전에 실패했습니다",
          500
        );
      }

      // Promote target user to OWNER
      const { error: promoteError } = await supabase
        .from("team_members")
        .update({ role: "OWNER" })
        .eq("team_id", teamId)
        .eq("user_id", userId);

      if (promoteError) {
        console.error("Promote new owner error:", promoteError);
        // Rollback: restore current user to OWNER
        await supabase
          .from("team_members")
          .update({ role: "OWNER" })
          .eq("team_id", teamId)
          .eq("user_id", user.id);

        return errorResponse(
          "UPDATE_FAILED",
          "소유권 이전에 실패했습니다",
          500
        );
      }

      // Update team owner_id
      const { error: teamUpdateError } = await supabase
        .from("teams")
        .update({ owner_id: userId })
        .eq("id", teamId);

      if (teamUpdateError) {
        console.error("Update team owner error:", teamUpdateError);
        // Rollback
        await supabase
          .from("team_members")
          .update({ role: targetMember.role })
          .eq("team_id", teamId)
          .eq("user_id", userId);
        await supabase
          .from("team_members")
          .update({ role: "OWNER" })
          .eq("team_id", teamId)
          .eq("user_id", user.id);

        return errorResponse(
          "UPDATE_FAILED",
          "소유권 이전에 실패했습니다",
          500
        );
      }

      // Log activity
      await logActivity(
        teamId,
        user.id,
        "ownership_transferred",
        "member",
        userId,
        { fromUserId: user.id, toUserId: userId, oldRole: targetMember.role }
      );

      return NextResponse.json({
        success: true,
        data: {
          message: "소유권이 이전되었습니다",
          newOwner: userId,
          previousOwner: user.id,
        },
      });
    }

    // Regular role change (ADMIN ↔ MEMBER)
    const { data: updatedMember, error: updateError } = await supabase
      .from("team_members")
      .update({ role: newRole })
      .eq("team_id", teamId)
      .eq("user_id", userId)
      .select()
      .single();

    if (updateError || !updatedMember) {
      console.error("Update member role error:", updateError);
      return errorResponse(
        "UPDATE_FAILED",
        "역할 변경에 실패했습니다",
        500
      );
    }

    // Log activity
    await logActivity(
      teamId,
      user.id,
      "role_changed",
      "member",
      userId,
      { oldRole: targetMember.role, newRole }
    );

    return NextResponse.json({
      success: true,
      data: {
        id: updatedMember.id,
        role: updatedMember.role,
      },
    });
  } catch (error) {
    console.error("PUT /api/teams/[teamId]/members/[userId] error:", error);
    return errorResponse(
      "INTERNAL_ERROR",
      "역할을 변경하는 중 오류가 발생했습니다",
      500
    );
  }
}

// DELETE /api/teams/[teamId]/members/[userId] - Remove member or leave team
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string; userId: string }> }
) {
  try {
    const { teamId, userId } = await params;
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return errorResponse("UNAUTHORIZED", "로그인이 필요합니다", 401);
    }

    // Check current user's role
    const { data: currentUserMembership, error: currentUserError } = await supabase
      .from("team_members")
      .select("role")
      .eq("team_id", teamId)
      .eq("user_id", user.id)
      .is("deleted_at", null)
      .single();

    if (currentUserError || !currentUserMembership) {
      return errorResponse(
        "TEAM_NOT_FOUND",
        "팀을 찾을 수 없거나 접근 권한이 없습니다",
        404
      );
    }

    // Get target member
    const { data: targetMember, error: targetError } = await supabase
      .from("team_members")
      .select("role")
      .eq("team_id", teamId)
      .eq("user_id", userId)
      .is("deleted_at", null)
      .single();

    if (targetError || !targetMember) {
      return errorResponse(
        "MEMBER_NOT_FOUND",
        "멤버를 찾을 수 없습니다",
        404
      );
    }

    const isSelfRemoval = user.id === userId;

    // Check if trying to remove OWNER
    if (targetMember.role === "OWNER") {
      if (isSelfRemoval) {
        return errorResponse(
          "OWNER_CANNOT_LEAVE",
          "OWNER는 탈퇴할 수 없습니다. 팀을 삭제하거나 소유권을 이전하세요.",
          403
        );
      } else {
        return errorResponse(
          "CANNOT_REMOVE_OWNER",
          "OWNER는 퇴장할 수 없습니다",
          403
        );
      }
    }

    // Permission checks for forced removal
    if (!isSelfRemoval) {
      if (currentUserMembership.role === "MEMBER") {
        return errorResponse(
          "INSUFFICIENT_PERMISSION",
          "멤버 퇴장 권한이 없습니다",
          403
        );
      }

      // ADMIN can only remove MEMBER, not other ADMIN
      if (
        currentUserMembership.role === "ADMIN" &&
        targetMember.role === "ADMIN"
      ) {
        return errorResponse(
          "INSUFFICIENT_PERMISSION",
          "ADMIN은 다른 ADMIN을 퇴장시킬 수 없습니다",
          403
        );
      }
    }

    // Soft delete the member
    const { error: deleteError } = await supabase
      .from("team_members")
      .update({ deleted_at: new Date().toISOString() })
      .eq("team_id", teamId)
      .eq("user_id", userId);

    if (deleteError) {
      console.error("Delete member error:", deleteError);
      return errorResponse(
        "DELETE_FAILED",
        isSelfRemoval ? "팀 탈퇴에 실패했습니다" : "멤버 퇴장에 실패했습니다",
        500
      );
    }

    // Log activity
    await logActivity(
      teamId,
      isSelfRemoval ? userId : user.id,
      isSelfRemoval ? "member_left" : "member_removed",
      "member",
      userId,
      { role: targetMember.role, isSelfRemoval }
    );

    return NextResponse.json({
      success: true,
      data: {
        message: isSelfRemoval
          ? "팀에서 탈퇴되었습니다"
          : "멤버가 퇴장되었습니다",
      },
    });
  } catch (error) {
    console.error("DELETE /api/teams/[teamId]/members/[userId] error:", error);
    return errorResponse(
      "INTERNAL_ERROR",
      "멤버를 제거하는 중 오류가 발생했습니다",
      500
    );
  }
}
