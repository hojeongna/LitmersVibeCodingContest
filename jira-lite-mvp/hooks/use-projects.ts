import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export interface Project {
  id: string;
  team_id: string;
  owner_id: string;
  name: string;
  description: string | null;
  key: string;
  is_archived: boolean;
  isFavorite: boolean;
  issueCount: number;
  created_at: string;
  updated_at: string;
  team: {
    id: string;
    name: string;
  };
  owner: {
    id: string;
    name: string;
    email: string;
    avatar_url: string | null;
  };
  issueStats?: Record<string, number>;
}

export interface CreateProjectInput {
  name: string;
  description?: string;
  teamId: string;
  key?: string;
}

export interface UpdateProjectInput {
  name?: string;
  description?: string;
}

// 프로젝트 목록 조회
export function useProjects(teamId?: string) {
  return useQuery({
    queryKey: ['projects', teamId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (teamId) params.append('teamId', teamId);

      const response = await fetch(`/api/projects?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch projects');
      const result = await response.json();
      return result.data as Project[];
    },
  });
}

// 프로젝트 상세 조회
export function useProject(projectId: string | null) {
  return useQuery({
    queryKey: ['projects', projectId],
    queryFn: async () => {
      if (!projectId) return null;
      const response = await fetch(`/api/projects/${projectId}`);
      if (!response.ok) throw new Error('Failed to fetch project');
      const result = await response.json();
      return result.data as Project;
    },
    enabled: !!projectId,
  });
}

// 프로젝트 생성
export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateProjectInput) => {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to create project');
      }

      const result = await response.json();
      return result.data as Project;
    },
    onSuccess: (project) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('프로젝트가 생성되었습니다', {
        description: `"${project.name}" 프로젝트가 생성되었습니다.`,
      });
    },
    onError: (error: Error) => {
      toast.error('프로젝트 생성 실패', {
        description: error.message,
      });
    },
  });
}

// 프로젝트 수정
export function useUpdateProject(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateProjectInput) => {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to update project');
      }

      const result = await response.json();
      return result.data as Project;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', projectId] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('프로젝트가 수정되었습니다');
    },
    onError: (error: Error) => {
      toast.error('프로젝트 수정 실패', {
        description: error.message,
      });
    },
  });
}

// 프로젝트 삭제
export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (projectId: string) => {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to delete project');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('프로젝트가 삭제되었습니다');
    },
    onError: (error: Error) => {
      toast.error('프로젝트 삭제 실패', {
        description: error.message,
      });
    },
  });
}

// 프로젝트 아카이브 토글
export function useArchiveProject(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/projects/${projectId}/archive`, {
        method: 'PUT',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to archive project');
      }

      const result = await response.json();
      return result.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['projects', projectId] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success(data.isArchived ? '프로젝트가 아카이브되었습니다' : '프로젝트가 복원되었습니다');
    },
    onError: (error: Error) => {
      toast.error('아카이브 실패', {
        description: error.message,
      });
    },
  });
}

// 프로젝트 즐겨찾기 토글
export function useFavoriteProject(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/projects/${projectId}/favorite`, {
        method: 'PUT',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to favorite project');
      }

      const result = await response.json();
      return result.data;
    },
    onMutate: async () => {
      // 낙관적 업데이트
      await queryClient.cancelQueries({ queryKey: ['projects'] });

      const previousProjects = queryClient.getQueryData(['projects']);

      queryClient.setQueryData(['projects'], (old: Project[] | undefined) => {
        if (!old) return old;
        return old.map((p) =>
          p.id === projectId ? { ...p, isFavorite: !p.isFavorite } : p
        );
      });

      return { previousProjects };
    },
    onError: (error: Error, _, context) => {
      // 에러 발생 시 롤백
      if (context?.previousProjects) {
        queryClient.setQueryData(['projects'], context.previousProjects);
      }
      toast.error('즐겨찾기 실패', {
        description: error.message,
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}
