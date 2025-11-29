import { NextRequest, NextResponse } from "next/server";
import { verifyFirebaseAuth } from "@/lib/firebase/auth-server";
import { createAdminClient } from "@/lib/supabase/admin";

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

// GET /api/teams/[teamId]/activities - Get team activity log
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const { teamId } = await params;
    const supabase = createAdminClient();
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const offset = (page - 1) * limit;

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

    // Get total count
    const { count, error: countError } = await supabase
      .from("team_activities")
      .select("*", { count: "exact", head: true })
      .eq("team_id", teamId);

    if (countError) {
      console.error("Count activities error:", countError);
      return errorResponse(
        "FETCH_FAILED",
        "활동 로그를 가져오는데 실패했습니다",
        500
      );
    }

    // Get activities with pagination
    const { data: activities, error: fetchError } = await supabase
      .from("team_activities")
      .select("id, team_id, actor_id, action, target_type, target_id, details, created_at")
      .eq("team_id", teamId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (fetchError) {
      console.error("Fetch activities error:", fetchError);
      return errorResponse(
        "FETCH_FAILED",
        "활동 로그를 가져오는데 실패했습니다",
        500
      );
    }

    // Get actor profiles
    const actorIds = [...new Set(activities?.map((a) => a.actor_id) || [])];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, name, avatar_url")
      .in("id", actorIds);

    // Merge activities with actor profiles
    const activitiesWithActors = activities?.map((activity) => {
      const actor = profiles?.find((p) => p.id === activity.actor_id);
      return {
        ...activity,
        actor: actor
          ? {
              name: actor.name,
              avatar_url: actor.avatar_url,
            }
          : null,
      };
    });

    const totalPages = Math.ceil((count || 0) / limit);
    const hasMore = page < totalPages;

    return NextResponse.json({
      success: true,
      data: activitiesWithActors || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages,
        hasMore,
      },
    });
  } catch (error) {
    console.error("GET /api/teams/[teamId]/activities error:", error);
    return errorResponse(
      "INTERNAL_ERROR",
      "활동 로그를 가져오는 중 오류가 발생했습니다",
      500
    );
  }
}
