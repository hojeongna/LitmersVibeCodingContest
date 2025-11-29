'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStatuses, useDeleteStatus, useUpdateStatus } from '@/hooks/use-statuses';
import { StatusFormModal } from './status-form-modal';
import { Skeleton } from '@/components/ui/skeleton';
import type { Status } from '@/types/status';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';

interface StatusSettingsPanelProps {
  projectId: string;
  userRole: 'OWNER' | 'ADMIN' | 'MEMBER';
}

function SortableStatusRow({ status, onEdit, onDelete, canModify }: {
  status: Status;
  onEdit: () => void;
  onDelete: () => void;
  canModify: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: status.id,
    disabled: !canModify,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-center gap-3 rounded-lg border bg-white p-3 dark:bg-zinc-900 dark:border-zinc-800',
        isDragging && 'opacity-50'
      )}
    >
      {/* Drag Handle */}
      <div {...attributes} {...listeners} className={cn('cursor-grab', !canModify && 'cursor-not-allowed opacity-50')}>
        <GripVertical className="h-5 w-5 text-zinc-400" />
      </div>

      {/* Color Swatch */}
      <div className="h-8 w-8 flex-shrink-0 rounded-md border-2 border-zinc-200 dark:border-zinc-700" style={{ backgroundColor: status.color || '#E4E4E7' }} />

      {/* Name */}
      <div className="flex-1">
        <div className="font-medium text-zinc-900 dark:text-zinc-100">{status.name}</div>
        {status.is_default && <span className="text-xs text-zinc-500">기본 상태</span>}
      </div>

      {/* WIP Limit */}
      <div className="w-24 text-center text-sm text-zinc-600 dark:text-zinc-400">
        {status.wip_limit ? `WIP: ${status.wip_limit}` : '무제한'}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onEdit} disabled={!canModify}>
          <Edit2 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onDelete}
          disabled={!canModify || status.is_default}
          className={cn(!status.is_default && canModify && 'hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950 dark:hover:text-red-400')}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export function StatusSettingsPanel({ projectId, userRole }: StatusSettingsPanelProps) {
  const { data, isLoading } = useStatuses(projectId);
  const deleteMutation = useDeleteStatus(projectId);
  const updateMutation = useUpdateStatus(projectId);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingStatus, setEditingStatus] = useState<Status | null>(null);
  const [statuses, setStatuses] = useState<Status[]>([]);

  const canModify = userRole === 'OWNER' || userRole === 'ADMIN';

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Update local statuses when data changes
  useEffect(() => {
    if (data?.statuses) {
      setStatuses(data.statuses);
    }
  }, [data]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setStatuses((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        const newItems = arrayMove(items, oldIndex, newIndex);

        // Update positions in database
        const movedStatus = newItems[newIndex];
        updateMutation.mutate({
          statusId: movedStatus.id,
          position: newIndex,
        });

        return newItems;
      });
    }
  };

  const handleAdd = () => {
    setEditingStatus(null);
    setModalOpen(true);
  };

  const handleEdit = (status: Status) => {
    setEditingStatus(status);
    setModalOpen(true);
  };

  const handleDelete = (status: Status) => {
    if (window.confirm(`"${status.name}" 상태를 삭제하시겠습니까? 해당 상태의 모든 이슈가 Backlog로 이동됩니다.`)) {
      deleteMutation.mutate(status.id);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  const statusList = data?.statuses || [];
  const canAddMore = statusList.length < 9;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">칸반 상태 관리</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            프로젝트의 칸반 보드 컬럼을 커스터마이징하세요 ({statusList.length}/9)
          </p>
        </div>
        <Button onClick={handleAdd} disabled={!canModify || !canAddMore}>
          <Plus className="mr-2 h-4 w-4" />
          상태 추가
        </Button>
      </div>

      {/* Status List */}
      {!canModify && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
          읽기 전용 모드입니다. OWNER 또는 ADMIN 권한이 필요합니다.
        </div>
      )}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={statusList.map((s) => s.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {statusList.map((status) => (
              <SortableStatusRow
                key={status.id}
                status={status}
                onEdit={() => handleEdit(status)}
                onDelete={() => handleDelete(status)}
                canModify={canModify}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Modal */}
      <StatusFormModal open={modalOpen} onClose={() => setModalOpen(false)} projectId={projectId} status={editingStatus} />
    </div>
  );
}
