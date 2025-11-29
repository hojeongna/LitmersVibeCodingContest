import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { TeamInvite, CreateInviteInput } from "@/types/team";

// Query keys
export const inviteKeys = {
  all: ["invites"] as const,
  lists: () => [...inviteKeys.all, "list"] as const,
  list: (teamId: string) => [...inviteKeys.lists(), teamId] as const,
};

// API Functions
async function fetchInvites(teamId: string): Promise<TeamInvite[]> {
  const response = await fetch(`/api/teams/${teamId}/invites`);
  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error?.message || "초대 목록을 가져오는데 실패했습니다");
  }

  return data.data;
}

async function createInvite({
  teamId,
  data,
}: {
  teamId: string;
  data: CreateInviteInput;
}): Promise<TeamInvite> {
  const response = await fetch(`/api/teams/${teamId}/invites`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.error?.message || "초대 생성에 실패했습니다");
  }

  return result.data;
}

async function cancelInvite(inviteId: string): Promise<void> {
  const response = await fetch(`/api/invites/${inviteId}`, {
    method: "DELETE",
  });

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error?.message || "초대 취소에 실패했습니다");
  }
}

async function resendInvite(inviteId: string): Promise<TeamInvite> {
  const response = await fetch(`/api/invites/${inviteId}/resend`, {
    method: "POST",
  });

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error?.message || "초대 재발송에 실패했습니다");
  }

  return data.data;
}

async function acceptInvite(token: string): Promise<{ teamId: string }> {
  const response = await fetch(`/api/invites/accept/${token}`, {
    method: "POST",
  });

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error?.message || "초대 수락에 실패했습니다");
  }

  return { teamId: data.data.teamId };
}

// Hooks
export function useInvites(teamId: string | null) {
  return useQuery({
    queryKey: inviteKeys.list(teamId || ""),
    queryFn: () => fetchInvites(teamId!),
    enabled: !!teamId,
    staleTime: 30 * 1000, // 30 seconds
  });
}

export function useCreateInvite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createInvite,
    onSuccess: (_, { teamId }) => {
      queryClient.invalidateQueries({ queryKey: inviteKeys.list(teamId) });
    },
  });
}

export function useCancelInvite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelInvite,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inviteKeys.lists() });
    },
  });
}

export function useResendInvite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: resendInvite,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inviteKeys.lists() });
    },
  });
}

export function useAcceptInvite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: acceptInvite,
    onSuccess: () => {
      // Invalidate team lists since user joined a new team
      queryClient.invalidateQueries({ queryKey: ["teams"] });
    },
  });
}
