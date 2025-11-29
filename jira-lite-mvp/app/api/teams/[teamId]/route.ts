import { NextRequest, NextResponse } from "next/server";
import { verifyFirebaseAuth } from "@/lib/firebase/auth-server";
import { createAdminClient } from "@/lib/supabase/admin";
import { logActivity } from "@/lib/services/activity";

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

// GET /api/teams/[teamId] - Get team detail with current user role
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const { teamId } = await params;
    const supabase = createAdminClient();

    // Check authentication
    const { user, error: authError } = await verifyFirebaseAuth();

    if (authError || !user) {
      return errorResponse("UNAUTHORIZED", "로그인이 필요합니다", 401);
    }

    // Get team with user's role
    const { data: teamMember, error: memberError } = await supabase
      .from("team_members")
      .select(
        `
        role,
        teams!inner (
          id,
          name,
          owner_id,
          created_at,
          updated_at
        )
      `
      )
      .eq("team_id", teamId)
      .eq("user_id", user.uid)
      .single();

    if (memberError || !teamMember) {
      return errorResponse(
        "TEAM_NOT_FOUND",
        "팀을 찾을 수 없거나 접근 권한이 없습니다",
        404
      );
    }

    const team = Array.isArray(teamMember.teams)
      ? teamMember.teams[0]
      : teamMember.teams;

    // Check if team is deleted
    if (!team) {
      return errorResponse("TEAM_NOT_FOUND", "팀을 찾을 수 없습니다", 404);
    }

    return NextResponse.json({
      success: true,
      data: {
        id: team.id,
        name: team.name,
        owner_id: team.owner_id,
        created_at: team.created_at,
        updated_at: team.updated_at,
        currentUserRole: teamMember.role,
      },
    });
  } catch (error) {
    console.error("GET /api/teams/[teamId] error:", error);
    return errorResponse(
      "INTERNAL_ERROR",
      "팀 정보를 가져오는 중 오류가 발생했습니다",
      500
    );
  }
}

// PUT /api/teams/[teamId] - Update team (OWNER or ADMIN only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const { teamId } = await params;
    const supabase = createAdminClient();

    // Check authentication
    const { user, error: authError } = await verifyFirebaseAuth();

    if (authError || !user) {
      return errorResponse("UNAUTHORIZED", "로그인이 필요합니다", 401);
    }

    // Parse request body
    const body = await request.json();
    const { name } = body;

    // Validate input
    if (!name || typeof name !== "string") {
      return errorResponse(
        "VALIDATION_ERROR",
        "팀 이름을 입력하세요",
        400
      );
    }

    if (name.trim().length < 1 || name.trim().length > 50) {
      return errorResponse(
        "VALIDATION_ERROR",
        "팀 이름은 1~50자 이내로 입력하세요",
        400
      );
    }

    // Check user's role in the team
    const { data: membership, error: memberError } = await supabase
      .from("team_members")
      .select("role")
      .eq("team_id", teamId)
      .eq("user_id", user.uid)
      .single();

    if (memberError || !membership) {
      return errorResponse(
        "TEAM_NOT_FOUND",
        "팀을 찾을 수 없거나 접근 권한이 없습니다",
        404
      );
    }

    // Check permission: OWNER or ADMIN can update
    if (membership.role !== "OWNER" && membership.role !== "ADMIN") {
      return errorResponse(
        "INSUFFICIENT_PERMISSION",
        "팀 수정 권한이 없습니다",
        403
      );
    }

    // Update team
    const { data: updatedTeam, error: updateError } = await supabase
      .from("teams")
      .update({
        name: name.trim(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", teamId)
      .is("deleted_at", null)
      .select()
      .single();

    if (updateError || !updatedTeam) {
      return errorResponse(
        "UPDATE_FAILED",
        "팀 정보 수정에 실패했습니다",
        500
      );
    }

    // Log activity
    await logActivity(
      teamId,
      user.uid,
      "team_updated",
      "team",
      teamId,
      { oldName: name, newName: updatedTeam.name }
    );

    return NextResponse.json({
      success: true,
      data: updatedTeam,
    });
  } catch (error) {
    console.error("PUT /api/teams/[teamId] error:", error);
    return errorResponse(
      "INTERNAL_ERROR",
      "팀 정보를 수정하는 중 오류가 발생했습니다",
      500
    );
  }
}

// DELETE /api/teams/[teamId] - Soft delete team (OWNER only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const { teamId } = await params;
    const supabase = createAdminClient();

    // Check authentication
    const { user, error: authError } = await verifyFirebaseAuth();

    if (authError || !user) {
      return errorResponse("UNAUTHORIZED", "로그인이 필요합니다", 401);
    }

    // Check user's role in the team
    const { data: membership, error: memberError } = await supabase
      .from("team_members")
      .select("role")
      .eq("team_id", teamId)
      .eq("user_id", user.uid)
      .single();

    if (memberError || !membership) {
      return errorResponse(
        "TEAM_NOT_FOUND",
        "팀을 찾을 수 없거나 접근 권한이 없습니다",
        404
      );
    }

    // Check permission: OWNER only can delete
    if (membership.role !== "OWNER") {
      return errorResponse(
        "INSUFFICIENT_PERMISSION",
        "팀 삭제는 OWNER만 가능합니다",
        403
      );
    }

    // Soft delete team
    const now = new Date().toISOString();
    const { error: deleteError } = await supabase
      .from("teams")
      .update({ deleted_at: now })
      .eq("id", teamId)
      .is("deleted_at", null);

    if (deleteError) {
      return errorResponse(
        "DELETE_FAILED",
        "팀 삭제에 실패했습니다",
        500
      );
    }

    // Get team name before deletion for logging
    const { data: team } = await supabase
      .from("teams")
      .select("name")
      .eq("id", teamId)
      .single();

    // Soft delete related data
    // Note: Projects and issues will be handled by database triggers or cascade
    // We do NOT soft delete team_members as the table doesn't support it.
    // They will become orphaned or we rely on team.deleted_at check.

    // Log activity
    await logActivity(
      teamId,
      user.uid,
      "team_deleted",
      "team",
      teamId,
      { teamName: team?.name }
    );

    return NextResponse.json({
      success: true,
      data: { message: "팀이 삭제되었습니다" },
    });
  } catch (error) {
    console.error("DELETE /api/teams/[teamId] error:", error);
    return errorResponse(
      "INTERNAL_ERROR",
      "팀을 삭제하는 중 오류가 발생했습니다",
      500
    );
  }
}
