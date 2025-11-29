"use client";

import { useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useDeleteTeam } from "@/hooks/use-teams";
import { TeamWithRole } from "@/types/team";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TeamDeleteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  team: TeamWithRole;
  onSuccess?: () => void;
}

export function TeamDeleteModal({
  open,
  onOpenChange,
  team,
  onSuccess,
}: TeamDeleteModalProps) {
  const [confirmText, setConfirmText] = useState("");
  const deleteTeam = useDeleteTeam();

  const isConfirmValid = confirmText === team.name;

  const handleDelete = async () => {
    if (!isConfirmValid) {
      toast.error("팀 이름을 정확히 입력해주세요");
      return;
    }

    try {
      await deleteTeam.mutateAsync(team.id);
      toast.success("팀이 삭제되었습니다");
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "팀 삭제에 실패했습니다"
      );
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!deleteTeam.isPending) {
      onOpenChange(newOpen);
      if (!newOpen) {
        setConfirmText(""); // Reset confirmation text when closing
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            팀 삭제
          </DialogTitle>
          <DialogDescription className="pt-2">
            정말로 &quot;{team.name}&quot; 팀을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* What will be deleted */}
          <div className="rounded-md border border-destructive/30 bg-destructive/5 p-4">
            <h4 className="text-sm font-medium mb-2">삭제될 항목:</h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• 모든 프로젝트 (0개)</li>
              <li>• 모든 이슈 (0개)</li>
              <li>• 모든 댓글 및 활동 기록</li>
              <li>• 팀 멤버 연결</li>
            </ul>
          </div>

          {/* Confirmation Input */}
          <div className="space-y-2">
            <Label htmlFor="confirm">
              팀 이름 &quot;{team.name}&quot;을 입력하여 확인:
            </Label>
            <Input
              id="confirm"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={team.name}
              disabled={deleteTeam.isPending}
              className={confirmText && !isConfirmValid ? "border-destructive" : ""}
            />
            {confirmText && !isConfirmValid && (
              <p className="text-xs text-destructive">
                팀 이름이 일치하지 않습니다
              </p>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={deleteTeam.isPending}
          >
            취소
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={!isConfirmValid || deleteTeam.isPending}
          >
            {deleteTeam.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            팀 삭제
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
