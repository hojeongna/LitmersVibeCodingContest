"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

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
import { createTeamSchema, type CreateTeamInput } from "@/lib/validations/team";
import { useCreateTeam } from "@/hooks/use-teams";

interface TeamCreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (teamId: string) => void;
}

export function TeamCreateModal({
  open,
  onOpenChange,
  onSuccess,
}: TeamCreateModalProps) {
  const [charCount, setCharCount] = useState(0);
  const createTeamMutation = useCreateTeam();

  const form = useForm<CreateTeamInput>({
    resolver: zodResolver(createTeamSchema),
    defaultValues: {
      name: "",
    },
  });

  const handleClose = () => {
    form.reset();
    setCharCount(0);
    onOpenChange(false);
  };

  const onSubmit = async (data: CreateTeamInput) => {
    try {
      const team = await createTeamMutation.mutateAsync(data);
      toast.success("팀이 생성되었습니다");
      handleClose();
      onSuccess?.(team.id);
    } catch (error) {
      const message = error instanceof Error ? error.message : "팀 생성에 실패했습니다";
      toast.error(message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>새 팀 만들기</DialogTitle>
          <DialogDescription>
            새로운 팀을 생성하고 멤버를 초대하세요.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="team-name">
              팀 이름 <span className="text-destructive">*</span>
            </Label>
            <Input
              id="team-name"
              placeholder="팀 이름을 입력하세요"
              {...form.register("name", {
                onChange: (e) => setCharCount(e.target.value.length),
              })}
              disabled={createTeamMutation.isPending}
              autoFocus
            />
            <div className="flex justify-between text-xs">
              <span className="text-destructive">
                {form.formState.errors.name?.message}
              </span>
              <span className="text-muted-foreground">
                {charCount}/50
              </span>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={createTeamMutation.isPending}
            >
              취소
            </Button>
            <Button
              type="submit"
              disabled={createTeamMutation.isPending}
            >
              {createTeamMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              팀 생성
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
