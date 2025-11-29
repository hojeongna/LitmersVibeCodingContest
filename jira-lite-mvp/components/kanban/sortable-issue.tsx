'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
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

  // 드래그 중일 때 원본 숨김 (DragOverlay에서 표시)
  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="h-[120px] rounded-lg border-2 border-dashed border-primary/50 bg-primary/5"
      />
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group relative"
    >
      {/* 드래그 핸들 */}
      <div
        {...attributes}
        {...listeners}
        className={cn(
          'absolute left-0 top-0 z-10 flex h-full w-8 cursor-grab items-center justify-center',
          'opacity-0 group-hover:opacity-100 transition-opacity',
          'hover:bg-zinc-100/80 dark:hover:bg-zinc-800/80 active:cursor-grabbing rounded-l-lg'
        )}
      >
        <GripVertical className="h-5 w-5 text-zinc-400 dark:text-zinc-500" />
      </div>
      <IssueCard
        issue={issue}
        onClick={onClick}
        className="pl-6"
      />
    </div>
  );
}
