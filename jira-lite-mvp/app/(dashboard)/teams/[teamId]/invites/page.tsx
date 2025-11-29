"use client";

import { use, useState } from "react";
import { useInvites, useCancelInvite, useResendInvite } from "@/hooks/use-invites";
import { InviteModal } from "@/components/teams/invite-modal";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Mail, MoreVertical, RefreshCw, Trash2, UserPlus, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";

interface PendingInvitesPageProps {
  params: Promise<{ teamId: string }>;
}

export default function PendingInvitesPage({ params }: PendingInvitesPageProps) {
  const { teamId } = use(params);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  const { data: invites, isLoading } = useInvites(teamId);
  const cancelInvite = useCancelInvite();
  const resendInvite = useResendInvite();

  const handleCancel = async (inviteId: string, email: string) => {
    try {
      await cancelInvite.mutateAsync(inviteId);
      toast.success("초대가 취소되었습니다", {
        description: `${email}에 대한 초대가 취소되었습니다.`,
      });
    } catch (error) {
      toast.error("초대 취소 실패", {
        description: error instanceof Error ? error.message : "초대를 취소하는 중 오류가 발생했습니다",
      });
    }
  };

  const handleResend = async (inviteId: string, email: string) => {
    try {
      await resendInvite.mutateAsync(inviteId);
      toast.success("초대를 다시 보냈습니다", {
        description: `${email}에게 초대 이메일이 재발송되었습니다.`,
      });
    } catch (error) {
      toast.error("초대 재발송 실패", {
        description: error instanceof Error ? error.message : "초대를 재발송하는 중 오류가 발생했습니다",
      });
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
      case "MEMBER":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "관리자";
      case "MEMBER":
        return "멤버";
      default:
        return role;
    }
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
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">대기 중인 초대</h2>
          <p className="text-muted-foreground">
            팀에 초대된 멤버 목록입니다. 초대는 7일간 유효합니다.
          </p>
        </div>
        <Button onClick={() => setIsInviteModalOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          멤버 초대
        </Button>
      </div>

      {!invites || invites.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 px-4">
          <Mail className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold mb-1">대기 중인 초대가 없습니다</h3>
          <p className="text-sm text-muted-foreground mb-4 text-center">
            새로운 멤버를 초대하여 팀에 추가하세요
          </p>
          <Button onClick={() => setIsInviteModalOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            멤버 초대
          </Button>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>이메일</TableHead>
                <TableHead>역할</TableHead>
                <TableHead>초대한 날짜</TableHead>
                <TableHead>만료 기간</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invites.map((invite) => (
                <TableRow key={invite.id}>
                  <TableCell className="font-medium">{invite.email}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getRoleBadgeColor(
                        invite.role
                      )}`}
                    >
                      {getRoleLabel(invite.role)}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDistanceToNow(new Date(invite.created_at), {
                      addSuffix: true,
                      locale: ko,
                    })}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      {formatDistanceToNow(new Date(invite.expires_at), {
                        locale: ko,
                      })}
                      {" 후"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleResend(invite.id, invite.email)}
                          disabled={resendInvite.isPending}
                        >
                          <RefreshCw className="mr-2 h-4 w-4" />
                          재발송
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleCancel(invite.id, invite.email)}
                          disabled={cancelInvite.isPending}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          취소
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <InviteModal
        teamId={teamId}
        open={isInviteModalOpen}
        onOpenChange={setIsInviteModalOpen}
      />
    </div>
  );
}
