import { NextRequest, NextResponse } from "next/server";
import { verifyFirebaseAuth } from "@/lib/firebase/auth-server";
import { adminAuth, adminStorage } from "@/lib/firebase/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase/config";

interface DeleteAccountRequest {
  password?: string;
  confirmText: string;
}

export async function POST(request: NextRequest) {
  try {
    // 1. Verify user authentication
    const { user } = await verifyFirebaseAuth();
    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "로그인이 필요합니다" } },
        { status: 401 }
      );
    }

    const body: DeleteAccountRequest = await request.json();
    const { password, confirmText } = body;

    // 2. Validate DELETE confirmation text
    if (confirmText !== "DELETE") {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_CONFIRMATION", message: '"DELETE"를 정확히 입력하세요' } },
        { status: 400 }
      );
    }

    const supabaseAdmin = createAdminClient();

    // 3. Check for owned teams (server-side verification)
    const { data: ownedTeams, error: teamsError } = await supabaseAdmin
      .from("teams")
      .select("id, name")
      .eq("owner_id", user.uid)
      .is("deleted_at", null);

    if (teamsError) {
      console.error("Failed to check owned teams:", teamsError);
      return NextResponse.json(
        { success: false, error: { code: "DATABASE_ERROR", message: "팀 정보를 확인하는 중 오류가 발생했습니다" } },
        { status: 500 }
      );
    }

    if (ownedTeams && ownedTeams.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "HAS_OWNED_TEAMS",
            message: "소유한 팀이 있어 계정을 삭제할 수 없습니다. 팀을 삭제하거나 소유권을 이전해주세요.",
          },
        },
        { status: 400 }
      );
    }

    // 4. Verify password for non-OAuth users
    const isOAuthUser = user.firebase?.sign_in_provider === "google.com";

    if (!isOAuthUser && password) {
      try {
        // Re-authenticate to verify password
        await signInWithEmailAndPassword(auth, user.email!, password);
      } catch (authError) {
        console.error("Password verification failed:", authError);
        return NextResponse.json(
          { success: false, error: { code: "INVALID_PASSWORD", message: "비밀번호가 올바르지 않습니다" } },
          { status: 400 }
        );
      }
    } else if (!isOAuthUser && !password) {
      return NextResponse.json(
        { success: false, error: { code: "PASSWORD_REQUIRED", message: "비밀번호를 입력하세요" } },
        { status: 400 }
      );
    }

    // 5. Start deletion process
    const userId = user.uid;

    // 5a. Soft delete comments (anonymize author)
    const { error: commentsError } = await supabaseAdmin
      .from("comments")
      .update({
        deleted_at: new Date().toISOString(),
      })
      .eq("author_id", userId);

    if (commentsError) {
      console.error("Failed to anonymize comments:", commentsError);
    }

    // 5b. Delete team memberships
    const { error: membershipError } = await supabaseAdmin
      .from("team_members")
      .delete()
      .eq("user_id", userId);

    if (membershipError) {
      console.error("Failed to delete team memberships:", membershipError);
    }

    // 5c. Delete notifications
    const { error: notificationsError } = await supabaseAdmin
      .from("notifications")
      .delete()
      .eq("user_id", userId);

    if (notificationsError) {
      console.error("Failed to delete notifications:", notificationsError);
    }

    // 5d. Delete AI rate limits
    const { error: rateLimitsError } = await supabaseAdmin
      .from("ai_rate_limits")
      .delete()
      .eq("user_id", userId);

    if (rateLimitsError) {
      console.error("Failed to delete AI rate limits:", rateLimitsError);
    }

    // 5e. Delete project favorites
    const { error: favoritesError } = await supabaseAdmin
      .from("project_favorites")
      .delete()
      .eq("user_id", userId);

    if (favoritesError) {
      console.error("Failed to delete project favorites:", favoritesError);
    }

    // 5f. Set issues assignee to null
    const { error: issuesAssigneeError } = await supabaseAdmin
      .from("issues")
      .update({ assignee_id: null })
      .eq("assignee_id", userId);

    if (issuesAssigneeError) {
      console.error("Failed to update issues assignee:", issuesAssigneeError);
    }

    // 5g. Soft delete profile
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .update({
        deleted_at: new Date().toISOString(),
        name: "삭제된 사용자",
        avatar_url: null,
      })
      .eq("id", userId);

    if (profileError) {
      console.error("Failed to soft delete profile:", profileError);
    }

    // 5h. Delete avatar from Firebase Storage
    try {
      const bucket = adminStorage.bucket();
      const avatarPath = `avatars/${userId}`;
      const [files] = await bucket.getFiles({ prefix: avatarPath });

      for (const file of files) {
        await file.delete().catch((e) => {
          console.error("Failed to delete avatar file:", e);
        });
      }
    } catch (storageError) {
      console.error("Failed to delete avatar from storage:", storageError);
      // Continue even if storage deletion fails
    }

    // 5i. Delete user from Firebase Auth
    try {
      await adminAuth.deleteUser(userId);
    } catch (authDeleteError) {
      console.error("Failed to delete Firebase user:", authDeleteError);
      return NextResponse.json(
        { success: false, error: { code: "AUTH_DELETE_FAILED", message: "계정 삭제에 실패했습니다. 잠시 후 다시 시도해주세요." } },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: { message: "계정이 삭제되었습니다" } });
  } catch (error) {
    console.error("Account deletion error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "계정 삭제 중 오류가 발생했습니다" } },
      { status: 500 }
    );
  }
}
