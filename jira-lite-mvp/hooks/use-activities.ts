import { useInfiniteQuery } from "@tanstack/react-query";

// Types
export interface TeamActivity {
  id: string;
  team_id: string;
  actor_id: string;
  action: string;
  target_type: string | null;
  target_id: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
  actor: {
    name: string | null;
    avatar_url: string | null;
  } | null;
}

export interface ActivitiesResponse {
  success: boolean;
  data: TeamActivity[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

// Query keys
export const activityKeys = {
  all: ["activities"] as const,
  lists: () => [...activityKeys.all, "list"] as const,
  list: (teamId: string) => [...activityKeys.lists(), teamId] as const,
};

// API Functions
async function fetchActivities(
  teamId: string,
  page: number = 1,
  limit: number = 20
): Promise<ActivitiesResponse> {
  const url = new URL(
    `/api/teams/${teamId}/activities`,
    window.location.origin
  );
  url.searchParams.set("page", page.toString());
  url.searchParams.set("limit", limit.toString());

  const response = await fetch(url.toString());
  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error?.message || "활동 로그를 가져오는데 실패했습니다");
  }

  return data;
}

// Hooks
export function useTeamActivities(teamId: string | null, limit: number = 20) {
  return useInfiniteQuery({
    queryKey: activityKeys.list(teamId || ""),
    queryFn: ({ pageParam }) =>
      fetchActivities(teamId!, pageParam as number, limit),
    getNextPageParam: (lastPage) =>
      lastPage.pagination.hasMore
        ? lastPage.pagination.page + 1
        : undefined,
    initialPageParam: 1,
    enabled: !!teamId,
    staleTime: 30 * 1000, // 30 seconds
  });
}
