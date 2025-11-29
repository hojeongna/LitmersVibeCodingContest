import { NextRequest, NextResponse } from "next/server";
import { verifyFirebaseAuth } from "@/lib/firebase/auth-server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createInviteSchema } from "@/lib/validations/invite";
import { sendTeamInvite } from "@/lib/email/templates/team-invite";
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

// POST /api/teams/[teamId]/invites - Create invitation
export async function POST(
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
        "멤버 초대 권한이 없습니다",
        403
      );
    }

    // Check if email is already a team member
    // Note: We need to find user by email first, but we can't easily do that without admin access to auth.users.
    // However, team_members table uses user_id.
    // So checking if "email is already a team member" is tricky if the user hasn't signed up yet.
    // But usually we check if the user exists in the system.
    // For now, let's assume we can't check if the email corresponds to an existing member unless we have a way to map email to user_id.
    // But wait, if the user is already in the team, they must have a user_id.
    // If we invite by email, we are creating an invite record.
    // The check "Check if email is already a team member" implies we want to prevent inviting someone who is already in.
    // If we can't map email to user_id easily here, maybe we skip this check or rely on client side?
    // Or maybe we can check profiles? Profiles usually have email.
    // Let's check if we can find a profile with this email.
    // But earlier I saw profiles table might not have email column in types.ts?
    // Let's re-verify types.ts.
    // types.ts: profiles table Row: id, name, avatar_url, created_at... NO EMAIL.
    // So we can't check existing member by email via profiles table.
    // We will skip this check for now or rely on the fact that if they accept the invite, we check then.
    // Or maybe we just check if there is an invite.

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
        // role, // Role column does not exist in team_invites table
        token,
        invited_by: user.uid,
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

    // Get team info and inviter profile for email
    const { data: team } = await supabase
      .from("teams")
      .select("name")
      .eq("id", teamId)
      .single();

    const { data: inviterProfile } = await supabase
      .from("profiles")
      .select("name") // Removed email from selection as it's not in types
      .eq("id", user.uid)
      .single();

    // Send invitation email via Resend
    try {
      await sendTeamInvite({
        email,
        teamName: team?.name || "팀",
        inviterName: inviterProfile?.name || "팀 관리자",
        token,
        role,
      });
    } catch (emailError) {
      console.error("Failed to send invite email:", emailError);
      // Don't fail the request if email fails - invitation is already created
    }

    // Log activity
    try {
      await logActivity(teamId, user.uid, "member_invited", "member", undefined, {
        email,
        role,
      });
    } catch (logError) {
      console.error("Failed to log activity:", logError);
      // Don't fail the request if activity log fails
    }

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
    const supabase = createAdminClient();

    // Check authentication
    const { user, error: authError } = await verifyFirebaseAuth();

    if (authError || !user) {
      return errorResponse("UNAUTHORIZED", "로그인이 필요합니다", 401);
    }

    // Check user's role in the team (must be OWNER or ADMIN)
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
