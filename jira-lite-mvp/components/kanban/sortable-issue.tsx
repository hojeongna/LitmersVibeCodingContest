'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { IssueCard } from './issue-card';
import type { IssueCard as IssueCardType } from '@/types/kanban';
import { cn } from '@/lib/utils';

interface SortableIssueProps {
  issue: IssueCardType;
  onClick?: () => void;
}

export function SortableIssue({ issue, onClick }: SortableIssueProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: issue.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        isDragging && 'z-50 rotate-3 opacity-90 shadow-lg scale-105',
        !isDragging && 'cursor-grab active:cursor-grabbing'
      )}
    >
      <IssueCard
        issue={issue}
        onClick={onClick}
        className={cn(isDragging && 'border-2 border-dashed border-primary bg-primary/5')}
      />
    </div>
  );
}
