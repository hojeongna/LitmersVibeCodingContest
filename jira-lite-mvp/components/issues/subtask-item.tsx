'use client';

import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Subtask, useUpdateSubtask, useDeleteSubtask } from '@/hooks/use-subtasks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Trash2, Edit2, Check, X, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SubtaskItemProps {
  subtask: Subtask;
  issueId: string;
}

export function SubtaskItem({ subtask, issueId }: SubtaskItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(subtask.title);

  const updateMutation = useUpdateSubtask(subtask.id, issueId);
  const deleteMutation = useDeleteSubtask(issueId);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: subtask.id });

  const handleToggleComplete = () => {
    updateMutation.mutate({ is_completed: !subtask.is_completed });
  };

  const handleStartEdit = () => {
    setIsEditing(true);
    setEditedTitle(subtask.title);
  };

  const handleSaveEdit = () => {
    if (editedTitle.trim() && editedTitle !== subtask.title) {
      updateMutation.mutate(
        { title: editedTitle.trim() },
        {
          onSuccess: () => setIsEditing(false),
        }
      );
    } else {
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedTitle(subtask.title);
  };

  const handleDelete = () => {
    if (confirm('이 서브태스크를 삭제하시겠습니까?')) {
      deleteMutation.mutate(subtask.id);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group flex items-center gap-2 py-2 px-3 rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors',
        isDragging && 'opacity-50'
      )}
    >
      <button
        className="cursor-grab active:cursor-grabbing touch-none opacity-0 group-hover:opacity-100 transition-opacity"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4 text-zinc-400" />
      </button>

      <Checkbox
        checked={subtask.is_completed}
        onCheckedChange={handleToggleComplete}
        disabled={updateMutation.isPending || deleteMutation.isPending}
      />

      {isEditing ? (
        <div className="flex-1 flex items-center gap-2">
          <Input
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            disabled={updateMutation.isPending}
            className="h-8 text-sm"
            maxLength={200}
          />
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 shrink-0"
            onClick={handleSaveEdit}
            disabled={updateMutation.isPending || !editedTitle.trim()}
          >
            <Check className="h-4 w-4 text-green-600" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 shrink-0"
            onClick={handleCancelEdit}
            disabled={updateMutation.isPending}
          >
            <X className="h-4 w-4 text-red-600" />
          </Button>
        </div>
      ) : (
        <>
          <span
            className={cn(
              'flex-1 text-sm transition-all',
              subtask.is_completed
                ? 'line-through text-zinc-500 dark:text-zinc-500'
                : 'text-zinc-900 dark:text-zinc-100'
            )}
          >
            {subtask.title}
          </span>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 shrink-0"
              onClick={handleStartEdit}
              disabled={updateMutation.isPending || deleteMutation.isPending}
            >
              <Edit2 className="h-3.5 w-3.5 text-zinc-600 dark:text-zinc-400" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 shrink-0"
              onClick={handleDelete}
              disabled={updateMutation.isPending || deleteMutation.isPending}
            >
              <Trash2 className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
