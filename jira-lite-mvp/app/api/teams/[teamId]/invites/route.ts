import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createInviteSchema } from "@/lib/validations/invite";

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

// POST /api/teams/[teamId]/invites - Create invitation
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const { teamId } = await params;
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
    const validation = createInviteSchema.safeParse(body);

    if (!validation.success) {
      const message = validation.error.issues[0]?.message || "입력값이 유효하지 않습니다";
      return errorResponse("VALIDATION_ERROR", message, 400);
    }

    const { email, role } = validation.data;

    // Check user's role in the team (must be OWNER or ADMIN)
    const { data: membership, error: memberError } = await supabase
      .from("team_members")
      .select("role")
      .eq("team_id", teamId)
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
        "멤버 초대 권한이 없습니다",
        403
      );
    }

    // Check if email is already a team member
    const { data: existingMember } = await supabase
      .from("team_members")
      .select("id")
      .eq("team_id", teamId)
      .eq("user_id", user.id)
      .is("deleted_at", null)
      .single();

    if (existingMember) {
      return errorResponse(
        "ALREADY_MEMBER",
        "이미 팀 멤버입니다",
        400
      );
    }

    // Check if there's already a pending invite for this email
    const { data: existingInvite } = await supabase
      .from("team_invites")
      .select("id")
      .eq("team_id", teamId)
      .eq("email", email)
      .gte("expires_at", new Date().toISOString())
      .single();

    if (existingInvite) {
      return errorResponse(
        "INVITE_EXISTS",
        "이미 대기 중인 초대가 있습니다",
        400
      );
    }

    // Generate invite token
    const token = crypto.randomUUID();

    // Calculate expiration date (7 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Create invitation
    const { data: invite, error: createError } = await supabase
      .from("team_invites")
      .insert({
        team_id: teamId,
        email,
        role,
        token,
        invited_by: user.id,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    if (createError || !invite) {
      console.error("Create invite error:", createError);
      return errorResponse(
        "CREATE_FAILED",
        "초대 생성에 실패했습니다",
        500
      );
    }

    // TODO: Send invitation email via Resend
    // await sendTeamInvite({ email, token, teamId });

    // TODO: Log activity
    // await ActivityLogService.log('member_invited', { teamId, email, role });

    return NextResponse.json({
      success: true,
      data: invite,
    });
  } catch (error) {
    console.error("POST /api/teams/[teamId]/invites error:", error);
    return errorResponse(
      "INTERNAL_ERROR",
      "초대를 생성하는 중 오류가 발생했습니다",
      500
    );
  }
}

// GET /api/teams/[teamId]/invites - Get pending invitations
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const { teamId } = await params;
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return errorResponse("UNAUTHORIZED", "로그인이 필요합니다", 401);
    }

    // Check user's role in the team (must be OWNER or ADMIN)
    const { data: membership, error: memberError } = await supabase
      .from("team_members")
      .select("role")
      .eq("team_id", teamId)
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
        "초대 목록 조회 권한이 없습니다",
        403
      );
    }

    // Get pending invitations (not expired)
    const { data: invites, error: fetchError } = await supabase
      .from("team_invites")
      .select("*")
      .eq("team_id", teamId)
      .gte("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false });

    if (fetchError) {
      console.error("Fetch invites error:", fetchError);
      return errorResponse(
        "FETCH_FAILED",
        "초대 목록을 가져오는데 실패했습니다",
        500
      );
    }

    return NextResponse.json({
      success: true,
      data: invites || [],
    });
  } catch (error) {
    console.error("GET /api/teams/[teamId]/invites error:", error);
    return errorResponse(
      "INTERNAL_ERROR",
      "초대 목록을 가져오는 중 오류가 발생했습니다",
      500
    );
  }
}
