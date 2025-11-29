"use client";

import { use, useState } from "react";
import { useTeamMembers, useUpdateMemberRole, useRemoveMember } from "@/hooks/use-members";
import { useAuth } from "@/components/providers/auth-provider";
import { InviteModal } from "@/components/teams/invite-modal";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { UserPlus, MoreVertical, Trash2, Shield, Crown, User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { TeamRole } from "@/lib/supabase/types";

interface TeamMembersPageProps {
  params: Promise<{ teamId: string }>;
}

export default function TeamMembersPage({ params }: TeamMembersPageProps) {
  const { teamId } = use(params);
  const { user } = useAuth();
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [roleFilter, setRoleFilter] = useState<TeamRole | "ALL">("ALL");
  const [roleChangeConfirm, setRoleChangeConfirm] = useState<{
    userId: string;
    currentRole: TeamRole;
    newRole: TeamRole;
    userName: string;
  } | null>(null);
  const [removeConfirm, setRemoveConfirm] = useState<{
    userId: string;
    userName: string;
  } | null>(null);

  const { data: members, isLoading } = useTeamMembers(
    teamId,
    roleFilter === "ALL" ? undefined : roleFilter
  );
  const updateRole = useUpdateMemberRole();
  const removeMember = useRemoveMember();

  const currentUserMember = members?.find((m) => m.user_id === user?.uid);
  const currentUserRole = currentUserMember?.role;

  const handleRoleChange = async () => {
    if (!roleChangeConfirm) return;

    try {
      await updateRole.mutateAsync({
        teamId,
        userId: roleChangeConfirm.userId,
        role: roleChangeConfirm.newRole,
      });

      const isOwnershipTransfer = roleChangeConfirm.newRole === "OWNER";
      toast.success(
        isOwnershipTransfer ? "소유권이 이전되었습니다" : "역할이 변경되었습니다",
        {
          description: isOwnershipTransfer
            ? `${roleChangeConfirm.userName}님이 새로운 OWNER가 되었습니다.`
            : `${roleChangeConfirm.userName}님의 역할이 ${getRoleLabel(roleChangeConfirm.newRole)}(으)로 변경되었습니다.`,
        }
      );

      setRoleChangeConfirm(null);
    } catch (error) {
      toast.error("역할 변경 실패", {
        description:
          error instanceof Error ? error.message : "역할을 변경하는 중 오류가 발생했습니다",
      });
    }
  };

  const handleRemove = async () => {
    if (!removeConfirm) return;

    try {
      await removeMember.mutateAsync({
        teamId,
        userId: removeConfirm.userId,
      });

      toast.success("멤버가 퇴장되었습니다", {
        description: `${removeConfirm.userName}님이 팀에서 퇴장되었습니다.`,
      });

      setRemoveConfirm(null);
    } catch (error) {
      toast.error("멤버 퇴장 실패", {
        description:
          error instanceof Error ? error.message : "멤버를 퇴장시키는 중 오류가 발생했습니다",
      });
    }
  };

  const getRoleLabel = (role: TeamRole) => {
    switch (role) {
      case "OWNER":
        return "소유자";
      case "ADMIN":
        return "관리자";
      case "MEMBER":
        return "멤버";
      default:
        return role;
    }
  };

  const getRoleBadge = (role: TeamRole) => {
    switch (role) {
      case "OWNER":
        return (
          <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold bg-gradient-to-r from-amber-500 to-amber-600 text-gray-900">
            <Crown className="h-3 w-3" />
            소유자
          </span>
        );
      case "ADMIN":
        return (
          <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-600 text-white">
            <Shield className="h-3 w-3" />
            관리자
          </span>
        );
      case "MEMBER":
        return (
          <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium bg-zinc-800 text-zinc-400">
            <User className="h-3 w-3" />
            멤버
          </span>
        );
    }
  };

  const canChangeRole = currentUserRole === "OWNER";
  const canRemoveMember = (targetRole: TeamRole) => {
    if (targetRole === "OWNER") return false;
    if (currentUserRole === "OWNER") return true;
    if (currentUserRole === "ADMIN" && targetRole === "MEMBER") return true;
    return false;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">팀 멤버</h2>
          <p className="text-muted-foreground">
            팀원 {members?.length || 0}명
          </p>
        </div>
        {(currentUserRole === "OWNER" || currentUserRole === "ADMIN") && (
          <Button onClick={() => setIsInviteModalOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            멤버 초대
          </Button>
        )}
      </div>

      <div className="flex items-center gap-4">
        <Select
          value={roleFilter}
          onValueChange={(value) => setRoleFilter(value as TeamRole | "ALL")}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">전체 역할</SelectItem>
            <SelectItem value="OWNER">소유자</SelectItem>
            <SelectItem value="ADMIN">관리자</SelectItem>
            <SelectItem value="MEMBER">멤버</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        {members?.map((member) => (
          <div
            key={member.id}
            className="flex items-center justify-between rounded-lg border p-4 hover:bg-accent/50 transition-colors"
          >
            <div className="flex items-center gap-4 flex-1">
              <Avatar className="h-10 w-10">
                {member.profile?.avatar_url ? (
                  <img
                    src={member.profile.avatar_url}
                    alt={member.profile.name || "User"}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-primary/10 text-primary font-semibold">
                    {member.profile?.name?.[0]?.toUpperCase() ||
                      member.profile?.email?.[0]?.toUpperCase() ||
                      "?"}
                  </div>
                )}
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium truncate">
                    {member.profile?.name || member.profile?.email}
                  </p>
                  {member.user_id === user?.uid && (
                    <span className="text-xs text-muted-foreground">(나)</span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground truncate">
                  {member.profile?.email}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(member.joined_at), {
                    addSuffix: true,
                    locale: ko,
                  })}{" "}
                  가입
                </p>
              </div>

              <div className="flex items-center gap-3">
                {getRoleBadge(member.role)}

                {member.role !== "OWNER" &&
                  (canChangeRole || canRemoveMember(member.role)) && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {canChangeRole && (
                          <>
                            {member.role !== "ADMIN" && (
                              <DropdownMenuItem
                                onClick={() =>
                                  setRoleChangeConfirm({
                                    userId: member.user_id,
                                    currentRole: member.role,
                                    newRole: "ADMIN",
                                    userName: member.profile?.name || member.profile?.email || "",
                                  })
                                }
                              >
                                <Shield className="mr-2 h-4 w-4" />
                                관리자로 승격
                              </DropdownMenuItem>
                            )}
                            {member.role !== "MEMBER" && (
                              <DropdownMenuItem
                                onClick={() =>
                                  setRoleChangeConfirm({
                                    userId: member.user_id,
                                    currentRole: member.role,
                                    newRole: "MEMBER",
                                    userName: member.profile?.name || member.profile?.email || "",
                                  })
                                }
                              >
                                <User className="mr-2 h-4 w-4" />
                                멤버로 강등
                              </DropdownMenuItem>
                            )}
                            {member.role === "ADMIN" && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() =>
                                    setRoleChangeConfirm({
                                      userId: member.user_id,
                                      currentRole: member.role,
                                      newRole: "OWNER",
                                      userName: member.profile?.name || member.profile?.email || "",
                                    })
                                  }
                                  className="text-amber-600"
                                >
                                  <Crown className="mr-2 h-4 w-4" />
                                  소유권 이전
                                </DropdownMenuItem>
                              </>
                            )}
                            <DropdownMenuSeparator />
                          </>
                        )}
                        {canRemoveMember(member.role) &&
                          member.user_id !== user?.uid && (
                            <DropdownMenuItem
                              onClick={() =>
                                setRemoveConfirm({
                                  userId: member.user_id,
                                  userName: member.profile?.name || member.profile?.email || "",
                                })
                              }
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              팀에서 퇴장
                            </DropdownMenuItem>
                          )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <InviteModal
        teamId={teamId}
        open={isInviteModalOpen}
        onOpenChange={setIsInviteModalOpen}
      />

      {/* Role Change Confirmation Dialog */}
      <AlertDialog
        open={!!roleChangeConfirm}
        onOpenChange={(open) => !open && setRoleChangeConfirm(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {roleChangeConfirm?.newRole === "OWNER"
                ? "소유권 이전 확인"
                : "역할 변경 확인"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {roleChangeConfirm?.newRole === "OWNER" ? (
                <>
                  <strong>{roleChangeConfirm.userName}</strong>님에게 소유권을 이전하시겠습니까?
                  <br />
                  <br />
                  소유권 이전 후:
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>{roleChangeConfirm.userName}님이 새로운 OWNER가 됩니다</li>
                    <li>현재 사용자는 ADMIN으로 변경됩니다</li>
                    <li>이 작업은 되돌릴 수 없습니다</li>
                  </ul>
                </>
              ) : (
                <>
                  <strong>{roleChangeConfirm?.userName}</strong>님의 역할을{" "}
                  <strong>{getRoleLabel(roleChangeConfirm?.newRole!)}</strong>(으)로
                  변경하시겠습니까?
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRoleChange}
              className={
                roleChangeConfirm?.newRole === "OWNER"
                  ? "bg-amber-600 hover:bg-amber-700"
                  : ""
              }
            >
              {roleChangeConfirm?.newRole === "OWNER" ? "소유권 이전" : "역할 변경"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Remove Member Confirmation Dialog */}
      <AlertDialog
        open={!!removeConfirm}
        onOpenChange={(open) => !open && setRemoveConfirm(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>멤버 퇴장 확인</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{removeConfirm?.userName}</strong>님을 팀에서 퇴장시키시겠습니까?
              <br />
              <br />이 멤버는 더 이상 이 팀에 접근할 수 없게 됩니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemove}
              className="bg-destructive hover:bg-destructive/90"
            >
              퇴장
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
