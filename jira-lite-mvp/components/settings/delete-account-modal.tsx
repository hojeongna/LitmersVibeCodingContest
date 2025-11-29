"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { useAuth } from "@/components/providers/auth-provider";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const deleteAccountSchema = z.object({
  password: z.string().optional(),
  confirmText: z.string(),
}).refine(
  (data) => data.confirmText === "DELETE",
  { message: '"DELETE"를 정확히 입력하세요', path: ["confirmText"] }
);

type DeleteAccountInput = z.infer<typeof deleteAccountSchema>;

interface OwnedTeam {
  id: string;
  name: string;
}

interface DeleteAccountModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteAccountModal({ open, onOpenChange }: DeleteAccountModalProps) {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [ownedTeams, setOwnedTeams] = useState<OwnedTeam[]>([]);

  const isOAuthUser = user?.providerData?.[0]?.providerId === "google.com";

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<DeleteAccountInput>({
    resolver: zodResolver(deleteAccountSchema),
    defaultValues: {
      confirmText: "",
    },
  });

  const confirmText = watch("confirmText");
  const password = watch("password");
  const canDelete =
    confirmText === "DELETE" &&
    ownedTeams.length === 0 &&
    (isOAuthUser || (password && password.length > 0));

  // Check for owned teams when modal opens
  useEffect(() => {
    async function checkOwnedTeams() {
      if (!open || !user) return;

      setIsChecking(true);
      try {
        const supabase = createClient();
        const { data: teams, error } = await supabase
          .from("teams")
          .select("id, name")
          .eq("owner_id", user.uid)
          .is("deleted_at", null);

        if (error) {
          console.error("Failed to check owned teams:", error);
          toast.error("팀 정보를 확인하는 중 오류가 발생했습니다");
          return;
        }

        setOwnedTeams(teams || []);
      } catch (err) {
        console.error("Error checking owned teams:", err);
      } finally {
        setIsChecking(false);
      }
    }

    checkOwnedTeams();
  }, [open, user]);

  const onSubmit = async (data: DeleteAccountInput) => {
    if (!user) {
      toast.error("로그인이 필요합니다");
      return;
    }

    if (ownedTeams.length > 0) {
      toast.error("소유한 팀을 먼저 삭제하거나 이전해주세요");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/account/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password: isOAuthUser ? undefined : data.password,
          confirmText: data.confirmText,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || "계정 삭제에 실패했습니다");
      }

      // Sign out and redirect
      await signOut();
      toast.success("계정이 삭제되었습니다");
      router.push("/login?deleted=true");
    } catch (err) {
      const error = err as Error;
      console.error("Account deletion error:", error);

      if (error.message.includes("password") || error.message.includes("credential")) {
        toast.error("비밀번호가 올바르지 않습니다");
      } else if (error.message.includes("team")) {
        toast.error("소유한 팀을 먼저 삭제하거나 이전해주세요");
      } else {
        toast.error(error.message || "계정 삭제 중 오류가 발생했습니다");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            계정 삭제
          </DialogTitle>
          <DialogDescription>
            정말 계정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
          </DialogDescription>
        </DialogHeader>

        {isChecking ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* What will be deleted */}
            <div className="bg-destructive/10 rounded-lg p-4 space-y-2">
              <p className="font-medium text-destructive">삭제되는 항목:</p>
              <ul className="text-sm text-muted-foreground ml-5 list-disc space-y-1">
                <li>프로필 및 개인 정보</li>
                <li>댓글 및 활동 기록</li>
                <li>팀 멤버십 (소유하지 않은 팀)</li>
              </ul>
            </div>

            {/* Team Owner Warning */}
            {ownedTeams.length > 0 && (
              <div className="bg-amber-100 dark:bg-amber-900/30 rounded-lg p-3 flex gap-2 items-start">
                <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-500 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-amber-800 dark:text-amber-200">
                    소유한 팀이 {ownedTeams.length}개 있습니다
                  </p>
                  <p className="text-amber-700 dark:text-amber-300 mt-1">
                    계정을 삭제하기 전에 팀을 삭제하거나 소유권을 이전해주세요.
                  </p>
                  <ul className="mt-2 space-y-1">
                    {ownedTeams.map((team) => (
                      <li key={team.id} className="text-amber-700 dark:text-amber-300">
                        • {team.name}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Password Input (non-OAuth users only) */}
            {!isOAuthUser && (
              <div className="space-y-2">
                <Label htmlFor="password">비밀번호 확인 *</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    disabled={ownedTeams.length > 0}
                    {...register("password")}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={ownedTeams.length > 0}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* DELETE Confirmation */}
            <div className="space-y-2">
              <Label htmlFor="confirmText">
                확인을 위해 <span className="font-mono font-bold">DELETE</span>를 입력하세요
              </Label>
              <Input
                id="confirmText"
                placeholder="DELETE"
                autoComplete="off"
                disabled={ownedTeams.length > 0}
                {...register("confirmText")}
              />
              {errors.confirmText && (
                <p className="text-sm text-destructive">{errors.confirmText.message}</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
                취소
              </Button>
              <Button
                type="submit"
                variant="destructive"
                disabled={isLoading || !canDelete}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    삭제 중...
                  </>
                ) : (
                  "계정 삭제"
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
