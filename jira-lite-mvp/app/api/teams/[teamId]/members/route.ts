import { NextRequest, NextResponse } from "next/server";
import { verifyFirebaseAuth } from "@/lib/firebase/auth-server";
import { createAdminClient } from "@/lib/supabase/admin";
import { TeamRole } from "@/lib/supabase/types";

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

// GET /api/teams/[teamId]/members - Get team members
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const { teamId } = await params;
    const supabase = createAdminClient();
    const { searchParams } = new URL(request.url);
    const roleFilter = searchParams.get("role");

    // Check authentication
    const { user, error: authError } = await verifyFirebaseAuth();

    if (authError || !user) {
      return errorResponse("UNAUTHORIZED", "로그인이 필요합니다", 401);
    }

    // Check user's team membership
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

    // Build query for team members
    let query = supabase
      .from("team_members")
      .select("id, user_id, role, joined_at")
      .eq("team_id", teamId)
      .order("joined_at", { ascending: true });

    // Apply role filter if provided
    if (roleFilter && ["OWNER", "ADMIN", "MEMBER"].includes(roleFilter)) {
      query = query.eq("role", roleFilter as TeamRole);
    }

    const { data: members, error: fetchError } = await query;

    if (fetchError) {
      console.error("Fetch members error:", fetchError);
      return errorResponse(
        "FETCH_FAILED",
        "멤버 목록을 가져오는데 실패했습니다",
        500
      );
    }

    // Get user profiles for all members
    const userIds = members?.map((m) => m.user_id) || [];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, name, avatar_url")
      .in("id", userIds);

    // Merge members with profiles
    const membersWithProfiles = members?.map((member) => {
      const profile = profiles?.find((p) => p.id === member.user_id);
      return {
        id: member.id,
        user_id: member.user_id,
        role: member.role,
        joined_at: member.joined_at,
        profile: profile
          ? {
              name: profile.name,
              avatar_url: profile.avatar_url,
            }
          : null,
      };
    });

    return NextResponse.json({
      success: true,
      data: membersWithProfiles || [],
    });
  } catch (error) {
    console.error("GET /api/teams/[teamId]/members error:", error);
    return errorResponse(
      "INTERNAL_ERROR",
      "멤버 목록을 가져오는 중 오류가 발생했습니다",
      500
    );
  }
}
