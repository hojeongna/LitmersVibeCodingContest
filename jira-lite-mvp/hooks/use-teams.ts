"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { TeamWithRole } from "@/types/team";
import { CreateTeamInput } from "@/lib/validations/team";
import { Team } from "@/lib/supabase/types";

// Query keys
export const teamKeys = {
  all: ["teams"] as const,
  lists: () => [...teamKeys.all, "list"] as const,
  list: (filters?: string) => [...teamKeys.lists(), { filters }] as const,
  details: () => [...teamKeys.all, "detail"] as const,
  detail: (id: string) => [...teamKeys.details(), id] as const,
};

// Fetch teams from API
async function fetchTeams(): Promise<TeamWithRole[]> {
  const res = await fetch("/api/teams");
  const json = await res.json();

  if (!json.success) {
    throw new Error(json.error?.message || "팀 목록을 불러오는데 실패했습니다");
  }

  return json.data;
}

// Create team via API
async function createTeam(data: CreateTeamInput): Promise<Team> {
  const res = await fetch("/api/teams", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const json = await res.json();

  if (!json.success) {
    throw new Error(json.error?.message || "팀 생성에 실패했습니다");
  }

  return json.data;
}

// Hook to fetch team list
export function useTeams() {
  return useQuery({
    queryKey: teamKeys.lists(),
    queryFn: fetchTeams,
    staleTime: 30 * 1000, // 30 seconds
  });
}

// Hook to create a new team
export function useCreateTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTeam,
    onSuccess: () => {
      // Invalidate and refetch team list
      queryClient.invalidateQueries({ queryKey: teamKeys.lists() });
    },
  });
}

// Fetch single team from API
async function fetchTeam(teamId: string): Promise<TeamWithRole> {
  const res = await fetch(`/api/teams/${teamId}`);
  const json = await res.json();

  if (!json.success) {
    throw new Error(json.error?.message || "팀 정보를 불러오는데 실패했습니다");
  }

  return json.data;
}

// Update team via API
async function updateTeam({
  teamId,
  data,
}: {
  teamId: string;
  data: { name: string };
}): Promise<Team> {
  const res = await fetch(`/api/teams/${teamId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const json = await res.json();

  if (!json.success) {
    throw new Error(json.error?.message || "팀 수정에 실패했습니다");
  }

  return json.data;
}

// Delete team via API
async function deleteTeam(teamId: string): Promise<{ message: string }> {
  const res = await fetch(`/api/teams/${teamId}`, {
    method: "DELETE",
  });

  const json = await res.json();

  if (!json.success) {
    throw new Error(json.error?.message || "팀 삭제에 실패했습니다");
  }

  return json.data;
}

// Hook to fetch a single team by ID
export function useTeam(teamId: string | null) {
  return useQuery({
    queryKey: teamKeys.detail(teamId || ""),
    queryFn: () => fetchTeam(teamId!),
    enabled: !!teamId,
    staleTime: 30 * 1000, // 30 seconds
  });
}

// Hook to update a team
export function useUpdateTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateTeam,
    onSuccess: (data, { teamId }) => {
      // Invalidate both list and detail queries
      queryClient.invalidateQueries({ queryKey: teamKeys.lists() });
      queryClient.invalidateQueries({ queryKey: teamKeys.detail(teamId) });
    },
  });
}

// Hook to delete a team
export function useDeleteTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTeam,
    onSuccess: () => {
      // Invalidate team list
      queryClient.invalidateQueries({ queryKey: teamKeys.lists() });
    },
  });
}
