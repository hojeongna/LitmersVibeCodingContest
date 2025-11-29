import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export interface Issue {
  id: string;
  project_id: string;
  owner_id: string;
  assignee_id: string | null;
  status_id: string;
  issue_number: number;
  title: string;
  description: string | null;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  due_date: string | null;
  position: number;
  created_at: string;
  updated_at: string;
  project?: {
    id: string;
    name: string;
    key: string;
  };
  status?: {
    id: string;
    name: string;
    color: string | null;
  };
  assignee?: {
    id: string;
    name: string;
    email: string;
    avatar_url: string | null;
  } | null;
  owner?: {
    id: string;
    name: string;
  };
  labels?: Array<{
    label: {
      id: string;
      name: string;
      color: string;
    };
  }>;
  subtasks?: Array<{
    id: string;
    issue_id: string;
    title: string;
    is_completed: boolean;
    position: number;
    created_at: string;
    updated_at: string;
  }>;
}

export interface CreateIssueInput {
  projectId: string;
  title: string;
  description?: string;
  priority?: 'HIGH' | 'MEDIUM' | 'LOW';
  statusId?: string;
  assigneeId?: string;
  dueDate?: string;
  labelIds?: string[];
}

export interface UpdateIssueInput {
  title?: string;
  description?: string;
  priority?: 'HIGH' | 'MEDIUM' | 'LOW';
  statusId?: string;
  assigneeId?: string | null;
  dueDate?: string | null;
  labelIds?: string[];
}

// 프로젝트의 이슈 목록 조회
export function useIssues(projectId: string | null) {
  return useQuery({
    queryKey: ['issues', projectId],
    queryFn: async () => {
      if (!projectId) return [];
      const response = await fetch(`/api/projects/${projectId}/issues`);
      if (!response.ok) throw new Error('Failed to fetch issues');
      const result = await response.json();
      return result.data as Issue[];
    },
    enabled: !!projectId,
  });
}

// 이슈 상세 조회
export function useIssue(issueId: string | null) {
  return useQuery({
    queryKey: ['issues', issueId],
    queryFn: async () => {
      if (!issueId) return null;
      const response = await fetch(`/api/issues/${issueId}`);
      if (!response.ok) throw new Error('Failed to fetch issue');
      const result = await response.json();
      return result.data as Issue;
    },
    enabled: !!issueId,
  });
}

// 이슈 생성
export function useCreateIssue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateIssueInput) => {
      const { projectId, ...payload } = data;
      const response = await fetch(`/api/projects/${projectId}/issues`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to create issue');
      }

      const result = await response.json();
      return result.data as Issue;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['issues', variables.projectId] });
      queryClient.invalidateQueries({ queryKey: ['kanban', variables.projectId] });
      toast.success('이슈가 생성되었습니다');
    },
    onError: (error: Error) => {
      toast.error('이슈 생성 실패', {
        description: error.message,
      });
    },
  });
}

// 이슈 수정
export function useUpdateIssue(issueId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateIssueInput) => {
      const response = await fetch(`/api/issues/${issueId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to update issue');
      }

      const result = await response.json();
      return result.data as Issue;
    },
    onSuccess: (issue) => {
      queryClient.invalidateQueries({ queryKey: ['issues', issueId] });
      queryClient.invalidateQueries({ queryKey: ['issues', issue.project_id] });
      queryClient.invalidateQueries({ queryKey: ['kanban', issue.project_id] });
      toast.success('이슈가 수정되었습니다');
    },
    onError: (error: Error) => {
      toast.error('이슈 수정 실패', {
        description: error.message,
      });
    },
  });
}

// 이슈 삭제
export function useDeleteIssue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ issueId, projectId }: { issueId: string; projectId: string }) => {
      const response = await fetch(`/api/issues/${issueId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to delete issue');
      }

      return { issueId, projectId };
    },
    onSuccess: ({ projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['issues', projectId] });
      queryClient.invalidateQueries({ queryKey: ['kanban', projectId] });
      toast.success('이슈가 삭제되었습니다');
    },
    onError: (error: Error) => {
      toast.error('이슈 삭제 실패', {
        description: error.message,
      });
    },
  });
}
