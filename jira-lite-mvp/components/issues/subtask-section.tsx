'use client';

import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { SubtaskItem } from './subtask-item';
import { SubtaskProgress } from './subtask-progress';
import { useCreateSubtask, useReorderSubtask } from '@/hooks/use-subtasks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, ListTodo } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface Subtask {
  id: string;
  issue_id: string;
  title: string;
  is_completed: boolean;
  position: number;
  created_at: string;
  updated_at: string;
}

interface SubtaskSectionProps {
  issueId: string;
  subtasks: Subtask[];
}

export function SubtaskSection({ issueId, subtasks }: SubtaskSectionProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  const createMutation = useCreateSubtask();
  const reorderMutation = useReorderSubtask(issueId);

  const sortedSubtasks = [...subtasks].sort((a, b) => a.position - b.position);
  const completedCount = subtasks.filter((st) => st.is_completed).length;
  const totalCount = subtasks.length;

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleAddSubtask = async () => {
    if (!newSubtaskTitle.trim()) return;

    if (totalCount >= 20) {
      alert('이슈당 최대 20개의 서브태스크만 생성할 수 있습니다');
      return;
    }

    createMutation.mutate(
      { issueId, title: newSubtaskTitle.trim() },
      {
        onSuccess: () => {
          setNewSubtaskTitle('');
          setIsAdding(false);
        },
      }
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddSubtask();
    } else if (e.key === 'Escape') {
      setIsAdding(false);
      setNewSubtaskTitle('');
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = sortedSubtasks.findIndex((st) => st.id === active.id);
    const newIndex = sortedSubtasks.findIndex((st) => st.id === over.id);

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    // 낙관적 업데이트를 위해 새 순서 계산
    const reorderedSubtasks = arrayMove(sortedSubtasks, oldIndex, newIndex);

    // 이동한 서브태스크의 새 position 계산
    const movedSubtask = sortedSubtasks[oldIndex];
    const newPosition = newIndex;

    // API 호출
    reorderMutation.mutate({
      subtaskId: movedSubtask.id,
      newPosition,
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ListTodo className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
            <CardTitle>서브태스크</CardTitle>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsAdding(true)}
            disabled={isAdding || totalCount >= 20}
          >
            <Plus className="mr-2 h-4 w-4" />
            추가
          </Button>
        </div>
        {totalCount > 0 && (
          <CardDescription className="pt-2">
            <SubtaskProgress completed={completedCount} total={totalCount} />
          </CardDescription>
        )}
      </CardHeader>

      <CardContent>
        {sortedSubtasks.length === 0 && !isAdding ? (
          <div className="text-center py-8 text-zinc-500 dark:text-zinc-400">
            <ListTodo className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">서브태스크가 없습니다</p>
            <p className="text-xs mt-1">작업을 세부 단계로 나누어 관리하세요</p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={sortedSubtasks.map((st) => st.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-1">
                {sortedSubtasks.map((subtask) => (
                  <SubtaskItem key={subtask.id} subtask={subtask} issueId={issueId} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}

        {isAdding && (
          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
            <Input
              value={newSubtaskTitle}
              onChange={(e) => setNewSubtaskTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="서브태스크 제목 입력..."
              autoFocus
              disabled={createMutation.isPending}
              maxLength={200}
              className="text-sm"
            />
            <Button
              size="sm"
              onClick={handleAddSubtask}
              disabled={createMutation.isPending || !newSubtaskTitle.trim()}
            >
              추가
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setIsAdding(false);
                setNewSubtaskTitle('');
              }}
              disabled={createMutation.isPending}
            >
              취소
            </Button>
          </div>
        )}

        {totalCount > 0 && (
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-3 pt-3 border-t border-zinc-200 dark:border-zinc-800">
            {totalCount}/20개 서브태스크 사용 중
          </p>
        )}
      </CardContent>
    </Card>
  );
}
