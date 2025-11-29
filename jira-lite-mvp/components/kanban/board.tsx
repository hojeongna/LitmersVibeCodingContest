'use client';

import { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCorners,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { useKanban, useMoveIssue } from '@/hooks/use-kanban';
import { KanbanColumn } from './column';
import { IssueCard } from './issue-card';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

interface KanbanBoardProps {
  projectId: string;
  onIssueClick: (issueId: string) => void;
  onAddIssue: (statusId: string) => void;
}

export function KanbanBoard({ projectId, onIssueClick, onAddIssue }: KanbanBoardProps) {
  const { data, isLoading, error } = useKanban(projectId);
  const moveMutation = useMoveIssue(projectId);

  const [activeId, setActiveId] = useState<string | null>(null);
  const [overColumnId, setOverColumnId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 5, // 5px 이동 후 드래그 시작
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor)
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;
    setOverColumnId(over ? (over.id as string) : null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || !data) {
      setActiveId(null);
      setOverColumnId(null);
      return;
    }

    const activeId = active.id as string;
    const overId = over.id as string;

    // 이슈를 찾기
    let sourceColumn = data.columns.find((col) => col.issues.some((issue) => issue.id === activeId));
    const activeIssue = sourceColumn?.issues.find((issue) => issue.id === activeId);

    if (!activeIssue) {
      setActiveId(null);
      setOverColumnId(null);
      return;
    }

    // 타겟 컬럼 찾기 (이슈 위에 드롭했을 때는 해당 이슈의 컬럼, 컬럼에 드롭했을 때는 해당 컬럼)
    let targetColumn = data.columns.find((col) => col.status.id === overId);
    if (!targetColumn) {
      targetColumn = data.columns.find((col) => col.issues.some((issue) => issue.id === overId));
    }

    if (!targetColumn) {
      setActiveId(null);
      setOverColumnId(null);
      return;
    }

    const targetStatusId = targetColumn.status.id;

    // WIP Limit 체크 (다른 컬럼으로 이동할 때만)
    if (sourceColumn?.status.id !== targetStatusId) {
      if (targetColumn.status.wip_limit && targetColumn.issueCount >= targetColumn.status.wip_limit) {
        toast.warning('WIP Limit 초과', {
          description: `"${targetColumn.status.name}" 컬럼의 WIP Limit(${targetColumn.status.wip_limit})을 초과했습니다. 작업을 완료하거나 다른 컬럼으로 이동을 고려하세요.`,
        });
      }
    }

    // 같은 컬럼 내에서 순서 변경
    if (sourceColumn?.status.id === targetStatusId) {
      const issues = sourceColumn.issues;
      const oldIndex = issues.findIndex((issue) => issue.id === activeId);
      const newIndex = overId === targetStatusId ? issues.length - 1 : issues.findIndex((issue) => issue.id === overId);

      if (oldIndex !== newIndex) {
        const newIssues = arrayMove(issues, oldIndex, newIndex);
        const newPosition = newIndex > 0 ? (newIssues[newIndex - 1].position + (newIssues[newIndex + 1]?.position || newIssues[newIndex - 1].position + 1000)) / 2 : newIssues[1]?.position / 2 || 500;

        moveMutation.mutate({
          issueId: activeId,
          status_id: targetStatusId,
          position: newPosition,
        });
      }
    } else {
      // 다른 컬럼으로 이동
      const targetIssues = targetColumn.issues;
      const newPosition = targetIssues.length > 0 ? Math.max(...targetIssues.map((i) => i.position)) + 1000 : 1000;

      moveMutation.mutate({
        issueId: activeId,
        status_id: targetStatusId,
        position: newPosition,
      });
    }

    setActiveId(null);
    setOverColumnId(null);
  };

  const activeIssue = activeId && data ? data.columns.flatMap((col) => col.issues).find((issue) => issue.id === activeId) : null;

  if (isLoading) {
    return (
      <div className="flex gap-4 overflow-x-auto p-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="min-w-[280px] max-w-[320px] space-y-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950">
        <div className="text-center">
          <p className="text-sm font-medium text-red-600 dark:text-red-400">칸반 보드를 불러올 수 없습니다</p>
          <p className="mt-1 text-xs text-red-500 dark:text-red-500">{error.message}</p>
        </div>
      </div>
    );
  }

  if (!data || data.columns.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed border-zinc-300 dark:border-zinc-700">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">칸반 보드를 설정해주세요</p>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto p-6">
        {data.columns.map((column) => (
          <KanbanColumn
            key={column.status.id}
            column={column}
            onIssueClick={onIssueClick}
            onAddIssue={onAddIssue}
            isOver={overColumnId === column.status.id}
          />
        ))}
      </div>
      <DragOverlay dropAnimation={null}>
        {activeIssue && (
          <div className="rotate-3 opacity-90 shadow-lg scale-105">
            <IssueCard issue={activeIssue} />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
