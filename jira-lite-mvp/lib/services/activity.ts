import { createClient } from "@/lib/supabase/server";

/**
 * Activity log actions
 */
export type ActivityAction =
  | "member_invited"
  | "member_joined"
  | "member_removed"
  | "member_left"
  | "role_changed"
  | "ownership_transferred"
  | "team_updated"
  | "team_deleted";

/**
 * Target types for activities
 */
export type ActivityTargetType = "member" | "team" | "project";

/**
 * Log an activity in the team activity log
 *
 * @param teamId - ID of the team
 * @param actorId - ID of the user performing the action
 * @param action - Type of action being performed
 * @param targetType - Type of entity being acted upon (optional)
 * @param targetId - ID of the entity being acted upon (optional)
 * @param details - Additional details about the action (optional)
 */
export async function logActivity(
  teamId: string,
  actorId: string,
  action: ActivityAction,
  targetType?: ActivityTargetType,
  targetId?: string,
  details?: Record<string, unknown>
): Promise<void> {
  try {
    const supabase = await createClient();

    const { error } = await supabase.from("team_activities").insert({
      team_id: teamId,
      actor_id: actorId,
      action,
      target_type: targetType,
      target_id: targetId,
      details,
    });

    if (error) {
      console.error("Failed to log activity:", error);
      // Don't throw - activity logging should not break the main operation
    }
  } catch (error) {
    console.error("Error logging activity:", error);
    // Don't throw - activity logging should not break the main operation
  }
}
