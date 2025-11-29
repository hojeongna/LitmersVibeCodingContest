import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { TeamRole } from "@/lib/supabase/types";

// Types
export interface TeamMemberProfile {
  name: string | null;
  email: string;
  avatar_url: string | null;
}

export interface TeamMember {
  id: string;
  user_id: string;
  role: TeamRole;
  joined_at: string;
  profile: TeamMemberProfile | null;
}

export interface UpdateMemberRoleInput {
  teamId: string;
  userId: string;
  role: TeamRole;
}

export interface RemoveMemberInput {
  teamId: string;
  userId: string;
}

// Query keys
export const memberKeys = {
  all: ["members"] as const,
  lists: () => [...memberKeys.all, "list"] as const,
  list: (teamId: string, role?: string) =>
    role ? [...memberKeys.lists(), teamId, role] : [...memberKeys.lists(), teamId],
};

// API Functions
async function fetchTeamMembers(
  teamId: string,
  role?: TeamRole
): Promise<TeamMember[]> {
  const url = new URL(`/api/teams/${teamId}/members`, window.location.origin);
  if (role) {
    url.searchParams.set("role", role);
  }

  const response = await fetch(url.toString());
  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error?.message || "멤버 목록을 가져오는데 실패했습니다");
  }

  return data.data;
}

async function updateMemberRole({
  teamId,
  userId,
  role,
}: UpdateMemberRoleInput): Promise<{ id: string; role: TeamRole }> {
  const response = await fetch(`/api/teams/${teamId}/members/${userId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ role }),
  });

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error?.message || "역할 변경에 실패했습니다");
  }

  return data.data;
}

async function removeMember({
  teamId,
  userId,
}: RemoveMemberInput): Promise<void> {
  const response = await fetch(`/api/teams/${teamId}/members/${userId}`, {
    method: "DELETE",
  });

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error?.message || "멤버 제거에 실패했습니다");
  }
}

// Hooks
export function useTeamMembers(teamId: string | null, role?: TeamRole) {
  return useQuery({
    queryKey: memberKeys.list(teamId || "", role),
    queryFn: () => fetchTeamMembers(teamId!, role),
    enabled: !!teamId,
    staleTime: 30 * 1000, // 30 seconds
  });
}

export function useUpdateMemberRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateMemberRole,
    onSuccess: (_, { teamId }) => {
      // Invalidate all member queries for this team
      queryClient.invalidateQueries({ queryKey: memberKeys.lists() });
      // Also invalidate team detail since role changes affect permissions
      queryClient.invalidateQueries({ queryKey: ["teams", "detail", teamId] });
    },
  });
}

export function useRemoveMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removeMember,
    onSuccess: (_, { teamId }) => {
      // Invalidate member lists
      queryClient.invalidateQueries({ queryKey: memberKeys.lists() });
      // Also invalidate team lists in case user left a team
      queryClient.invalidateQueries({ queryKey: ["teams"] });
    },
  });
}

// Convenience hook for leaving a team (same as removing self)
export function useLeaveTeam() {
  return useRemoveMember();
}

// Convenience hook for transferring ownership (role change to OWNER)
export function useTransferOwnership() {
  return useUpdateMemberRole();
}
