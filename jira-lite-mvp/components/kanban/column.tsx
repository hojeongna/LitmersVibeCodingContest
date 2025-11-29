'use client';

import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { Plus, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { SortableIssue } from './sortable-issue';
import type { KanbanColumn as KanbanColumnType } from '@/types/kanban';
import { cn } from '@/lib/utils';

interface KanbanColumnProps {
  column: KanbanColumnType;
  onIssueClick: (issueId: string) => void;
  isOver?: boolean;
}

export function KanbanColumn({ column, onIssueClick, isOver }: KanbanColumnProps) {
  const { status, issues, issueCount, isOverWipLimit } = column;

  const { setNodeRef } = useDroppable({
    id: status.id,
  });

  // 컬럼별 테두리 색상
  const borderColor = status.color || '#E4E4E7';

  // WIP Limit 경고 레벨 계산
  const wipWarningLevel = status.wip_limit
    ? issueCount / status.wip_limit >= 1
      ? 'exceeded'
      : issueCount / status.wip_limit >= 0.8
      ? 'warning'
      : 'normal'
    : 'normal';

  return (
    <div
      className={cn(
        'flex min-w-[280px] max-w-[320px] flex-col rounded-lg border-t-4',
        isOver && 'bg-primary/5',
        isOverWipLimit && 'bg-red-50/50 dark:bg-red-950/20'
      )}
      style={{ borderTopColor: borderColor }}
    >
      {/* Column Header */}
      <div
        className={cn(
          'flex items-center justify-between border-b bg-white px-4 py-3 dark:bg-zinc-900',
          isOver ? 'border-primary border-2 border-dashed' : 'border-zinc-200 dark:border-zinc-800',
          isOverWipLimit && 'border-red-300 dark:border-red-800'
        )}
      >
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">{status.name}</h3>
          <span
            className={cn(
              'rounded-full px-2 py-0.5 text-xs',
              wipWarningLevel === 'exceeded' && 'bg-red-100 text-red-600 font-bold dark:bg-red-900/30 dark:text-red-400',
              wipWarningLevel === 'warning' && 'bg-amber-100 text-amber-600 font-medium dark:bg-amber-900/30 dark:text-amber-400',
              wipWarningLevel === 'normal' && 'bg-zinc-100 text-zinc-500 font-medium dark:bg-zinc-800 dark:text-zinc-400'
            )}
          >
            {status.wip_limit ? `${issueCount}/${status.wip_limit}` : issueCount}
          </span>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">컬럼 메뉴</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>WIP Limit 설정</DropdownMenuItem>
            <DropdownMenuItem>색상 변경</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Card Container with SortableContext */}
      <div
        ref={setNodeRef}
        className="flex-1 space-y-3 overflow-y-auto bg-zinc-50 p-4 dark:bg-zinc-950"
        style={{ maxHeight: 'calc(100vh - 280px)' }}
      >
        <SortableContext items={issues.map((i) => i.id)} strategy={verticalListSortingStrategy}>
          {issues.map((issue) => (
            <SortableIssue key={issue.id} issue={issue} onClick={() => onIssueClick(issue.id)} />
          ))}
        </SortableContext>
        {issues.length === 0 && (
          <div className="flex h-32 items-center justify-center rounded-lg border-2 border-dashed border-zinc-300 text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
            이슈가 없습니다
          </div>
        )}
      </div>

      {/* Add Card Button */}
      <div className="border-t border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900">
        <Button variant="ghost" className="w-full justify-start text-zinc-600 dark:text-zinc-400" size="sm">
          <Plus className="mr-2 h-4 w-4" />
          이슈 추가
        </Button>
      </div>
    </div>
  );
}
