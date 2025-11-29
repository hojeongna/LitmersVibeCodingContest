import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createTeamSchema } from "@/lib/validations/team";
import { TeamWithRole } from "@/types/team";

// Standard API response format
function successResponse<T>(data: T) {
  return NextResponse.json({ success: true, data });
}

function errorResponse(code: string, message: string, status: number = 400) {
  return NextResponse.json(
    { success: false, error: { code, message } },
    { status }
  );
}

// GET /api/teams - Get list of teams for current user
export async function GET() {
  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return errorResponse("UNAUTHORIZED", "로그인이 필요합니다", 401);
    }

    // Fetch teams the user is a member of with their role
    const { data: teamMembers, error: fetchError } = await supabase
      .from("team_members")
      .select(`
        role,
        teams!inner (
          id,
          name,
          owner_id,
          created_at,
          updated_at,
          deleted_at
        )
      `)
      .eq("user_id", user.id)
      .is("teams.deleted_at", null);

    if (fetchError) {
      console.error("Error fetching teams:", fetchError);
      return errorResponse("DATABASE_ERROR", "팀 목록을 불러오는데 실패했습니다", 500);
    }

    // Transform the response to include role at the top level
    const teams: TeamWithRole[] = (teamMembers || []).map((tm) => ({
      // Type assertion needed due to Supabase join structure
      ...(tm.teams as unknown as TeamWithRole),
      role: tm.role,
    }));

    return successResponse(teams);
  } catch (error) {
    console.error("Unexpected error in GET /api/teams:", error);
    return errorResponse("INTERNAL_ERROR", "서버 오류가 발생했습니다", 500);
  }
}

// POST /api/teams - Create a new team
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return errorResponse("UNAUTHORIZED", "로그인이 필요합니다", 401);
    }

    // Parse and validate request body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return errorResponse("INVALID_JSON", "유효하지 않은 요청 형식입니다", 400);
    }

    const validation = createTeamSchema.safeParse(body);
    if (!validation.success) {
      const message = validation.error.issues[0]?.message || "입력값이 유효하지 않습니다";
      return errorResponse("VALIDATION_ERROR", message, 400);
    }

    const { name } = validation.data;

    // Create team
    const { data: team, error: createError } = await supabase
      .from("teams")
      .insert({
        name: name.trim(),
        owner_id: user.id,
      })
      .select()
      .single();

    if (createError) {
      console.error("Error creating team:", createError);
      return errorResponse("DATABASE_ERROR", "팀 생성에 실패했습니다", 500);
    }

    // Add creator as OWNER in team_members
    const { error: memberError } = await supabase
      .from("team_members")
      .insert({
        team_id: team.id,
        user_id: user.id,
        role: "OWNER",
      });

    if (memberError) {
      console.error("Error adding team member:", memberError);
      // Rollback: delete the team if member insertion fails
      await supabase.from("teams").delete().eq("id", team.id);
      return errorResponse("DATABASE_ERROR", "팀 멤버 추가에 실패했습니다", 500);
    }

    return successResponse(team);
  } catch (error) {
    console.error("Unexpected error in POST /api/teams:", error);
    return errorResponse("INTERNAL_ERROR", "서버 오류가 발생했습니다", 500);
  }
}
