'use client';

import { useState, useMemo } from 'react';
import { IssueFilterPanel, IssueFilters } from './issue-filter-panel';
import { IssueListItem } from './issue-list-item';
import { Issue } from '@/hooks/use-issues';
import { Skeleton } from '@/components/ui/skeleton';
import { ListFilter } from 'lucide-react';

interface IssueListProps {
  issues: Issue[];
  projectKey: string;
  isLoading?: boolean;
  statuses?: Array<{ id: string; name: string; color: string | null }>;
  teamMembers?: Array<{
    user_id: string;
    profiles?: { name: string; email: string };
  }>;
  labels?: Array<{ id: string; name: string; color: string }>;
}

export function IssueList({
  issues,
  projectKey,
  isLoading = false,
  statuses = [],
  teamMembers = [],
  labels = [],
}: IssueListProps) {
  const [filters, setFilters] = useState<IssueFilters>({
    searchQuery: '',
    statusId: null,
    assigneeId: null,
    priority: 'ALL',
    labelIds: [],
    sortBy: 'created_at',
  });

  // Apply filters and sorting to issues
  const filteredIssues = useMemo(() => {
    // First, filter issues
    const filtered = issues.filter((issue) => {
      // Search query filter (title or description)
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const matchesTitle = issue.title.toLowerCase().includes(query);
        const matchesDescription = issue.description?.toLowerCase().includes(query) || false;
        if (!matchesTitle && !matchesDescription) return false;
      }

      // Status filter
      if (filters.statusId && issue.status_id !== filters.statusId) {
        return false;
      }

      // Assignee filter
      if (filters.assigneeId) {
        if (filters.assigneeId === 'unassigned') {
          if (issue.assignee_id !== null) return false;
        } else {
          if (issue.assignee_id !== filters.assigneeId) return false;
        }
      }

      // Priority filter
      if (filters.priority !== 'ALL' && issue.priority !== filters.priority) {
        return false;
      }

      // Label filter
      if (filters.labelIds.length > 0) {
        const issueLabels = issue.labels?.map((l) => l.label.id) || [];
        const hasAllLabels = filters.labelIds.every((labelId) =>
          issueLabels.includes(labelId)
        );
        if (!hasAllLabels) return false;
      }

      return true;
    });

    // Then, sort the filtered issues
    const sorted = [...filtered].sort((a, b) => {
      switch (filters.sortBy) {
        case 'created_at':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'updated_at':
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
        case 'priority': {
          const priorityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        case 'due_date': {
          // Issues with no due date go to the end
          if (!a.due_date && !b.due_date) return 0;
          if (!a.due_date) return 1;
          if (!b.due_date) return -1;
          return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
        }
        default:
          return 0;
      }
    });

    return sorted;
  }, [issues, filters]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-48 w-full" />
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter Panel */}
      <IssueFilterPanel
        filters={filters}
        onFiltersChange={setFilters}
        statuses={statuses}
        teamMembers={teamMembers}
        labels={labels}
        issueCount={filteredIssues.length}
      />

      {/* Issue List */}
      {filteredIssues.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg">
          <ListFilter className="h-12 w-12 mx-auto mb-3 text-zinc-400 dark:text-zinc-600" />
          <p className="text-zinc-600 dark:text-zinc-400 font-medium mb-1">
            {issues.length === 0 ? '이슈가 없습니다' : '검색 결과가 없습니다'}
          </p>
          <p className="text-sm text-zinc-500 dark:text-zinc-500">
            {issues.length === 0
              ? '새 이슈를 만들어 작업을 시작하세요'
              : '다른 검색어나 필터를 시도해보세요'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredIssues.map((issue) => (
            <IssueListItem key={issue.id} issue={issue} projectKey={projectKey} />
          ))}
        </div>
      )}
    </div>
  );
}
