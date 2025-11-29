'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PriorityBadge } from '@/components/ui/priority-badge';
import { LabelTag } from '@/components/ui/label-tag';
import { SubtaskProgress } from '@/components/issues/subtask-progress';
import { Calendar } from 'lucide-react';
import { format, isPast, isToday, isTomorrow } from 'date-fns';
import { ko } from 'date-fns/locale';
import type { IssueCard as IssueCardType } from '@/types/kanban';
import { cn } from '@/lib/utils';

interface IssueCardProps {
  issue: IssueCardType;
  onClick?: () => void;
  className?: string;
}

export function IssueCard({ issue, onClick, className }: IssueCardProps) {
  const dueDateText = issue.due_date
    ? (() => {
        const date = new Date(issue.due_date);
        if (isToday(date)) return '오늘';
        if (isTomorrow(date)) return '내일';
        return format(date, 'M월 d일', { locale: ko });
      })()
    : null;

  const isOverdue = issue.due_date && isPast(new Date(issue.due_date)) && !isToday(new Date(issue.due_date));

  return (
    <div
      onClick={onClick}
      className={cn(
        'group relative cursor-pointer rounded-lg border border-zinc-200 bg-white p-3 shadow-sm transition-all hover:shadow-md',
        'dark:border-zinc-800 dark:bg-zinc-900',
        className
      )}
    >
      {/* Header - Issue ID & Priority */}
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{issue.id.slice(0, 8)}</span>
        <PriorityBadge priority={issue.priority} />
      </div>

      {/* Title */}
      <h3 className="mb-2 line-clamp-2 text-sm font-medium text-zinc-900 dark:text-zinc-100">{issue.title}</h3>

      {/* Labels */}
      {issue.labels.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-1">
          {issue.labels.slice(0, 3).map((label) => (
            <LabelTag key={label.id} label={label.name} bgColor={label.color} textColor="#FFFFFF" preset="custom" />
          ))}
          {issue.labels.length > 3 && (
            <span className="text-xs text-zinc-500 dark:text-zinc-400">+{issue.labels.length - 3}</span>
          )}
        </div>
      )}

      {/* Subtask Progress */}
      {issue.subtask_count > 0 && (
        <div className="mb-3">
          <SubtaskProgress completed={issue.subtask_completed} total={issue.subtask_count} />
        </div>
      )}

      {/* Footer - Assignee & Due Date */}
      <div className="flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400">
        <div className="flex items-center gap-2">
          {issue.assignee && (
            <Avatar className="h-5 w-5">
              <AvatarImage src={issue.assignee.avatar_url || undefined} alt={issue.assignee.name} />
              <AvatarFallback className="text-[10px]">
                {issue.assignee.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          )}
        </div>
        {dueDateText && (
          <div className={cn('flex items-center gap-1', isOverdue && 'text-red-600 dark:text-red-400')}>
            <Calendar className="h-3 w-3" />
            <span>{dueDateText}</span>
          </div>
        )}
      </div>
    </div>
  );
}
