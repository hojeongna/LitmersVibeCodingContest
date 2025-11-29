'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ColorPicker } from '@/components/ui/color-picker';
import { useCreateStatus, useUpdateStatus } from '@/hooks/use-statuses';
import type { Status } from '@/types/status';

interface StatusFormModalProps {
  open: boolean;
  onClose: () => void;
  projectId: string;
  status?: Status | null;
}

export function StatusFormModal({ open, onClose, projectId, status }: StatusFormModalProps) {
  const [name, setName] = useState('');
  const [color, setColor] = useState('#3B82F6');
  const [wipLimitEnabled, setWipLimitEnabled] = useState(false);
  const [wipLimit, setWipLimit] = useState<number>(5);

  const createMutation = useCreateStatus(projectId);
  const updateMutation = useUpdateStatus(projectId);

  const isEditMode = !!status;

  useEffect(() => {
    if (status) {
      setName(status.name);
      setColor(status.color || '#3B82F6');
      setWipLimitEnabled(status.wip_limit !== null);
      setWipLimit(status.wip_limit || 5);
    } else {
      setName('');
      setColor('#3B82F6');
      setWipLimitEnabled(false);
      setWipLimit(5);
    }
  }, [status, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || name.length === 0 || name.length > 30) {
      return;
    }

    if (!/^#[0-9A-Fa-f]{6}$/.test(color)) {
      return;
    }

    const data = {
      name,
      color,
      wip_limit: wipLimitEnabled ? wipLimit : null,
    };

    if (isEditMode && status) {
      await updateMutation.mutateAsync({
        statusId: status.id,
        ...data,
      });
    } else {
      await createMutation.mutateAsync(data);
    }

    onClose();
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? '상태 수정' : '새 상태 추가'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">
              이름 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: Testing"
              maxLength={30}
              required
            />
            <p className="text-xs text-zinc-500">{name.length}/30자</p>
          </div>

          {/* Color */}
          <div className="space-y-2">
            <ColorPicker value={color} onChange={setColor} label="색상" />
          </div>

          {/* WIP Limit */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="wip-limit-enabled"
                checked={wipLimitEnabled}
                onCheckedChange={(checked) => setWipLimitEnabled(checked === true)}
              />
              <Label htmlFor="wip-limit-enabled" className="cursor-pointer">
                WIP Limit 설정
              </Label>
            </div>

            {wipLimitEnabled && (
              <div className="space-y-2">
                <Label htmlFor="wip-limit">최대 이슈 수</Label>
                <Input
                  id="wip-limit"
                  type="number"
                  min={1}
                  max={50}
                  value={wipLimit}
                  onChange={(e) => setWipLimit(parseInt(e.target.value, 10))}
                  className="w-32"
                />
                <p className="text-xs text-zinc-500">1-50 사이의 값을 입력하세요</p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              취소
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? '저장 중...' : isEditMode ? '수정' : '추가'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
