import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Suspense } from "react";

const errorMessages: Record<string, { title: string; description: string }> = {
  cancelled: {
    title: "로그인이 취소되었습니다",
    description: "Google 로그인을 취소하셨습니다. 다시 시도해주세요.",
  },
  access_denied: {
    title: "접근이 거부되었습니다",
    description: "Google 계정 접근 권한이 거부되었습니다. 다시 시도하거나 다른 계정을 사용해주세요.",
  },
  session_error: {
    title: "세션 오류가 발생했습니다",
    description: "로그인 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
  },
  network_error: {
    title: "네트워크 오류가 발생했습니다",
    description: "인터넷 연결을 확인하고 다시 시도해주세요.",
  },
  unknown: {
    title: "오류가 발생했습니다",
    description: "예상치 못한 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
  },
};

async function ErrorContent({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; description?: string }>;
}) {
  const params = await searchParams;
  const errorCode = params?.error || "unknown";
  const errorInfo = errorMessages[errorCode] || errorMessages.unknown;

  return (
    <>
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
          <AlertCircle className="h-6 w-6 text-destructive" />
        </div>
        <CardTitle className="text-xl">{errorInfo.title}</CardTitle>
        <CardDescription>{errorInfo.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button asChild className="w-full">
          <Link href="/login">로그인 페이지로 돌아가기</Link>
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          문제가 지속되면 관리자에게 문의해주세요.
        </p>
      </CardContent>
    </>
  );
}

export default function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; description?: string }>;
}) {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Card>
          <Suspense
            fallback={
              <CardHeader className="text-center">
                <CardTitle className="text-xl">로딩 중...</CardTitle>
              </CardHeader>
            }
          >
            <ErrorContent searchParams={searchParams} />
          </Suspense>
        </Card>
      </div>
    </div>
  );
}
