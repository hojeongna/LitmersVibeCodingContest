import { useQuery } from '@tanstack/react-query';

export interface HistoryEntry {
  id: string;
  issue_id: string;
  changed_by: string;
  field_name: string;
  old_value: string | null;
  new_value: string | null;
  created_at: string;
  changedBy?: {
    id: string;
    name: string;
    avatar_url: string | null;
  };
}

// 이슈 히스토리 조회
export function useIssueHistory(issueId: string | null) {
  return useQuery({
    queryKey: ['issues', issueId, 'history'],
    queryFn: async () => {
      if (!issueId) return [];
      const response = await fetch(`/api/issues/${issueId}/history`);
      if (!response.ok) throw new Error('Failed to fetch issue history');
      const result = await response.json();
      return result.data as HistoryEntry[];
    },
    enabled: !!issueId,
  });
}
