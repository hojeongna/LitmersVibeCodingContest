"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createInviteSchema, CreateInviteInput } from "@/lib/validations/invite";
import { useCreateInvite } from "@/hooks/use-invites";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Mail, UserPlus } from "lucide-react";

interface InviteModalProps {
  teamId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InviteModal({ teamId, open, onOpenChange }: InviteModalProps) {
  const createInvite = useCreateInvite();
  const [selectedRole, setSelectedRole] = useState<"ADMIN" | "MEMBER">("MEMBER");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateInviteInput>({
    resolver: zodResolver(createInviteSchema),
    defaultValues: {
      email: "",
      role: "MEMBER",
    },
  });

  const onSubmit = async (data: CreateInviteInput) => {
    try {
      await createInvite.mutateAsync({
        teamId,
        data: { ...data, role: selectedRole },
      });

      toast.success("초대를 보냈습니다", {
        description: `${data.email}에게 초대 이메일이 발송되었습니다.`,
      });

      reset();
      setSelectedRole("MEMBER");
      onOpenChange(false);
    } catch (error) {
      toast.error("초대 실패", {
        description: error instanceof Error ? error.message : "초대를 보내는 중 오류가 발생했습니다",
      });
    }
  };

  const handleClose = () => {
    reset();
    setSelectedRole("MEMBER");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            팀 멤버 초대
          </DialogTitle>
          <DialogDescription>
            이메일로 팀에 멤버를 초대할 수 있습니다. 초대는 7일간 유효합니다.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 pt-2">
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-1.5">
              <Mail className="h-4 w-4" />
              이메일
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="member@example.com"
              {...register("email")}
              className={errors.email ? "border-destructive" : ""}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">역할</Label>
            <Select
              value={selectedRole}
              onValueChange={(value) => setSelectedRole(value as "ADMIN" | "MEMBER")}
            >
              <SelectTrigger id="role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MEMBER">
                  <div className="flex flex-col items-start">
                    <span className="font-medium">멤버</span>
                    <span className="text-xs text-muted-foreground">
                      프로젝트와 이슈를 조회하고 편집할 수 있습니다
                    </span>
                  </div>
                </SelectItem>
                <SelectItem value="ADMIN">
                  <div className="flex flex-col items-start">
                    <span className="font-medium">관리자</span>
                    <span className="text-xs text-muted-foreground">
                      멤버 관리 및 팀 설정을 변경할 수 있습니다
                    </span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              취소
            </Button>
            <Button type="submit" disabled={createInvite.isPending}>
              {createInvite.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  초대 중...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  초대 보내기
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
