'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PriorityBadge } from '@/components/ui/priority-badge';
import { EmptyState } from '@/components/ui/empty-state';
import { ArrowUp, ArrowDown, Inbox, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useState } from 'react';
import type { SortField, SortOrder } from '@/types/view';

interface Issue {
  id: string;
  title: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  status: { id: string; name: string; color: string | null };
  assignee: { id: string; name: string; avatar_url: string | null } | null;
  due_date: string | null;
  created_at: string;
}

interface ListViewProps {
  issues: Issue[];
  onIssueClick: (issueId: string) => void;
  onCreateIssue?: () => void;
}

export function ListView({ issues, onIssueClick, onCreateIssue }: ListViewProps) {
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle order if same field
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field with default desc
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const sortedIssues = [...issues].sort((a, b) => {
    let comparison = 0;

    switch (sortField) {
      case 'priority': {
        const priorityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };
        comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
        break;
      }
      case 'status':
        comparison = a.status.name.localeCompare(b.status.name);
        break;
      case 'assignee': {
        const aName = a.assignee?.name || '';
        const bName = b.assignee?.name || '';
        comparison = aName.localeCompare(bName);
        break;
      }
      case 'due_date': {
        const aDate = a.due_date ? new Date(a.due_date).getTime() : 0;
        const bDate = b.due_date ? new Date(b.due_date).getTime() : 0;
        comparison = aDate - bDate;
        break;
      }
      case 'created_at': {
        const aDate = new Date(a.created_at).getTime();
        const bDate = new Date(b.created_at).getTime();
        comparison = aDate - bDate;
        break;
      }
    }

    return sortOrder === 'asc' ? comparison : -comparison;
  });

  if (issues.length === 0) {
    return (
      <EmptyState
        icon={Inbox}
        title="이슈가 없습니다"
        description="새 이슈를 만들어 프로젝트를 시작하세요."
        action={onCreateIssue ? { label: '+ 새 이슈 만들기', onClick: onCreateIssue } : undefined}
      />
    );
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortOrder === 'asc' ? (
      <ArrowUp className="ml-1 inline h-3 w-3" />
    ) : (
      <ArrowDown className="ml-1 inline h-3 w-3" />
    );
  };

  return (
    <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <table className="w-full">
        <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400">ID</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400">제목</th>
            <th
              className="cursor-pointer px-4 py-3 text-left text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              onClick={() => handleSort('status')}
            >
              상태
              <SortIcon field="status" />
            </th>
            <th
              className="cursor-pointer px-4 py-3 text-left text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              onClick={() => handleSort('priority')}
            >
              우선순위
              <SortIcon field="priority" />
            </th>
            <th
              className="cursor-pointer px-4 py-3 text-left text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              onClick={() => handleSort('assignee')}
            >
              담당자
              <SortIcon field="assignee" />
            </th>
            <th
              className="cursor-pointer px-4 py-3 text-left text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              onClick={() => handleSort('due_date')}
            >
              마감일
              <SortIcon field="due_date" />
            </th>
            <th
              className="cursor-pointer px-4 py-3 text-left text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              onClick={() => handleSort('created_at')}
            >
              생성일
              <SortIcon field="created_at" />
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {sortedIssues.map((issue) => (
            <tr
              key={issue.id}
              onClick={() => onIssueClick(issue.id)}
              className="cursor-pointer transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
            >
              <td className="px-4 py-3 text-sm text-zinc-500 dark:text-zinc-400">{issue.id.slice(0, 8)}</td>
              <td className="px-4 py-3 text-sm font-medium text-zinc-900 dark:text-zinc-100">{issue.title}</td>
              <td className="px-4 py-3">
                <span
                  className="inline-flex items-center rounded-sm px-2 py-0.5 text-xs font-medium"
                  style={{
                    backgroundColor: issue.status.color ? `${issue.status.color}20` : '#F4F4F5',
                    color: issue.status.color || '#71717A',
                  }}
                >
                  {issue.status.name}
                </span>
              </td>
              <td className="px-4 py-3">
                <PriorityBadge priority={issue.priority} />
              </td>
              <td className="px-4 py-3">
                {issue.assignee ? (
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={issue.assignee.avatar_url || undefined} alt={issue.assignee.name} />
                      <AvatarFallback className="text-xs">
                        {issue.assignee.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-zinc-600 dark:text-zinc-300">{issue.assignee.name}</span>
                  </div>
                ) : (
                  <span className="text-sm text-zinc-400 dark:text-zinc-500">미할당</span>
                )}
              </td>
              <td className="px-4 py-3">
                {issue.due_date ? (
                  <div className="flex items-center gap-1 text-sm text-zinc-600 dark:text-zinc-300">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(issue.due_date), 'MM/dd', { locale: ko })}
                  </div>
                ) : (
                  <span className="text-sm text-zinc-400 dark:text-zinc-500">-</span>
                )}
              </td>
              <td className="px-4 py-3 text-sm text-zinc-500 dark:text-zinc-400">
                {format(new Date(issue.created_at), 'MM/dd', { locale: ko })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
