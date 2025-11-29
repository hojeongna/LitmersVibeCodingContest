'use client';

import Link from 'next/link';
import { Issue } from '@/hooks/use-issues';
import { PriorityBadge } from '@/components/ui/priority-badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { SubtaskProgress } from './subtask-progress';
import { Calendar, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface IssueListItemProps {
  issue: Issue;
  projectKey: string;
}

export function IssueListItem({ issue, projectKey }: IssueListItemProps) {
  const subtasks = issue.subtasks || [];
  const completedSubtasks = subtasks.filter((st) => st.is_completed).length;
  const isDueSoon =
    issue.due_date &&
    new Date(issue.due_date) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) &&
    new Date(issue.due_date) > new Date();
  const isOverdue = issue.due_date && new Date(issue.due_date) < new Date();

  return (
    <Link
      href={`/projects/${issue.project_id}/issues/${issue.id}`}
      className="block p-4 border border-zinc-200 dark:border-zinc-800 rounded-md hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-sm transition-all"
    >
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400">
                {issue.id.slice(0, 8)}
              </span>
              <PriorityBadge priority={issue.priority} />
              {issue.status && (
                <Badge
                  variant="outline"
                  className="text-xs"
                  style={{
                    borderColor: issue.status.color || undefined,
                    color: issue.status.color || undefined,
                  }}
                >
                  {issue.status.name}
                </Badge>
              )}
            </div>
            <h3 className="font-medium text-zinc-900 dark:text-zinc-100 line-clamp-2">
              {issue.title}
            </h3>
          </div>

          {/* Assignee */}
          {issue.assignee && (
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                {issue.assignee.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          )}
        </div>

        {/* Description Preview */}
        {issue.description && (
          <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2">
            {issue.description}
          </p>
        )}

        {/* Labels */}
        {issue.labels && issue.labels.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {issue.labels.slice(0, 3).map((labelWrapper) => (
              <span
                key={labelWrapper.label.id}
                className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
                style={{
                  backgroundColor: labelWrapper.label.color + '20',
                  color: labelWrapper.label.color,
                }}
              >
                {labelWrapper.label.name}
              </span>
            ))}
            {issue.labels.length > 3 && (
              <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                +{issue.labels.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
          <div className="flex items-center gap-3">
            {/* Due Date */}
            {issue.due_date && (
              <div
                className={cn(
                  'flex items-center gap-1',
                  isOverdue && 'text-red-600 dark:text-red-400 font-medium',
                  isDueSoon && 'text-orange-600 dark:text-orange-400 font-medium'
                )}
              >
                <Calendar className="h-3.5 w-3.5" />
                <span>{format(new Date(issue.due_date), 'M월 d일', { locale: ko })}</span>
              </div>
            )}

            {/* Comment Count (placeholder - would need actual data) */}
            {/* <div className="flex items-center gap-1">
              <MessageSquare className="h-3.5 w-3.5" />
              <span>0</span>
            </div> */}
          </div>

          {/* Subtask Progress */}
          {subtasks.length > 0 && (
            <div className="flex-shrink-0">
              <SubtaskProgress completed={completedSubtasks} total={subtasks.length} />
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
