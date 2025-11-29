"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";
import { useAcceptInvite } from "@/hooks/use-invites";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle2, XCircle, UserPlus } from "lucide-react";

interface InviteAcceptPageProps {
  params: Promise<{ token: string }>;
}

export default function InviteAcceptPage({ params }: InviteAcceptPageProps) {
  const { token } = use(params);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const acceptInvite = useAcceptInvite();

  const [status, setStatus] = useState<"pending" | "accepting" | "success" | "error">("pending");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [teamId, setTeamId] = useState<string>("");

  useEffect(() => {
    // Wait for auth to load
    if (authLoading) return;

    // If not logged in, redirect to login with return URL
    if (!user) {
      router.push(`/login?redirect=/invite/${token}`);
      return;
    }

    // Auto-accept invite once user is authenticated
    handleAccept();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]);

  const handleAccept = async () => {
    setStatus("accepting");

    try {
      const result = await acceptInvite.mutateAsync(token);
      setTeamId(result.teamId);
      setStatus("success");

      // Redirect to team page after 2 seconds
      setTimeout(() => {
        router.push(`/teams/${result.teamId}`);
      }, 2000);
    } catch (error) {
      setStatus("error");
      setErrorMessage(
        error instanceof Error ? error.message : "초대를 수락하는 중 오류가 발생했습니다"
      );
    }
  };

  if (authLoading || status === "pending") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="max-w-md w-full mx-4 text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <h2 className="text-xl font-semibold">초대 확인 중...</h2>
          <p className="text-muted-foreground">잠시만 기다려주세요</p>
        </div>
      </div>
    );
  }

  if (status === "accepting") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="max-w-md w-full mx-4 text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <h2 className="text-xl font-semibold">팀에 가입하는 중...</h2>
          <p className="text-muted-foreground">초대를 처리하고 있습니다</p>
        </div>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="max-w-md w-full mx-4 space-y-6">
          <div className="text-center space-y-4">
            <div className="bg-green-100 dark:bg-green-900/30 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-2xl font-bold">초대를 수락했습니다!</h2>
            <p className="text-muted-foreground">
              팀에 성공적으로 가입되었습니다. 잠시 후 팀 페이지로 이동합니다.
            </p>
          </div>

          <Button
            className="w-full"
            size="lg"
            onClick={() => router.push(`/teams/${teamId}`)}
          >
            <UserPlus className="mr-2 h-5 w-5" />
            팀 페이지로 이동
          </Button>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="max-w-md w-full mx-4 space-y-6">
          <div className="text-center space-y-4">
            <div className="bg-red-100 dark:bg-red-900/30 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
              <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-2xl font-bold">초대 수락 실패</h2>
          </div>

          <Alert variant="destructive">
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">다음 이유로 초대를 수락할 수 없습니다:</p>
            <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
              <li>초대가 만료되었을 수 있습니다 (7일 이상 경과)</li>
              <li>이미 팀 멤버일 수 있습니다</li>
              <li>초대된 이메일과 로그인한 이메일이 다를 수 있습니다</li>
              <li>초대가 취소되었을 수 있습니다</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => router.push("/teams")}
            >
              팀 목록으로
            </Button>
            <Button
              className="flex-1"
              onClick={() => window.location.reload()}
            >
              다시 시도
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
