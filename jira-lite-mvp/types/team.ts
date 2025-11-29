// Team-related TypeScript types
// Based on the database schema from lib/supabase/types.ts

import { Team, TeamMember, TeamRole } from "@/lib/supabase/types";

// Re-export for convenience
export type { Team, TeamMember, TeamRole };

// Extended team type with current user's role
export interface TeamWithRole extends Team {
  role?: TeamRole; // For list response
  currentUserRole?: TeamRole; // For detail response
}

// API response types
export interface CreateTeamInput {
  name: string;
}

export interface TeamListResponse {
  success: true;
  data: TeamWithRole[];
}

export interface TeamCreateResponse {
  success: true;
  data: Team;
}

export interface TeamErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

export type TeamApiResponse = TeamListResponse | TeamCreateResponse | TeamErrorResponse;

// Team color utilities (for visual distinction)
export const TEAM_COLORS = [
  "#5B5FC7", // Indigo (Primary)
  "#3B82F6", // Blue
  "#22C55E", // Green
  "#F59E0B", // Amber
  "#EF4444", // Red
  "#8B5CF6", // Violet
  "#EC4899", // Pink
  "#14B8A6", // Teal
] as const;

export function getTeamColor(teamId: string): string {
  // Generate consistent color based on team ID
  const hash = teamId.split("").reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  return TEAM_COLORS[Math.abs(hash) % TEAM_COLORS.length];
}

// Team Invite types
export interface TeamInvite {
  id: string;
  team_id: string;
  email: string;
  role: TeamRole;
  token: string;
  invited_by: string;
  expires_at: string;
  created_at: string;
}

export interface CreateInviteInput {
  email: string;
  role: "ADMIN" | "MEMBER";
}
