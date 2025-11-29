"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AIButton } from "@/components/ui/ai-button";
import { PriorityBadge } from "@/components/ui/priority-badge";
import { LabelTag } from "@/components/ui/label-tag";
import { useAuth } from "@/hooks/use-auth";
import {
  AlertCircle,
  CheckCircle,
  Info,
  AlertTriangle,
  Plus,
  Loader2,
} from "lucide-react";

export default function ComponentTestPage() {
  const { user, loading: authLoading } = useAuth();
  const [aiLoading, setAiLoading] = useState(false);

  const handleAIClick = () => {
    setAiLoading(true);
    setTimeout(() => {
      setAiLoading(false);
      toast.success("AI 분석이 완료되었습니다!");
    }, 2000);
  };

  return (
    <div className="space-y-8 pb-10">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">UI 컴포넌트 테스트</h1>
        <p className="text-muted-foreground">
          모든 shadcn/ui 및 커스텀 컴포넌트를 확인할 수 있습니다.
        </p>
      </div>

      {/* Auth Status */}
      <Card>
        <CardHeader>
          <CardTitle>인증 상태 (AC-5 검증)</CardTitle>
          <CardDescription>useAuth 훅으로 사용자 상태 접근</CardDescription>
        </CardHeader>
        <CardContent>
          {authLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>로딩 중...</span>
            </div>
          ) : user ? (
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={user.photoURL || undefined} />
                <AvatarFallback>
                  {user.email?.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{user.email}</p>
                <p className="text-sm text-muted-foreground">로그인됨</p>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">로그인하지 않음</p>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="buttons" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="buttons">버튼</TabsTrigger>
          <TabsTrigger value="inputs">입력</TabsTrigger>
          <TabsTrigger value="feedback">피드백</TabsTrigger>
          <TabsTrigger value="custom">커스텀</TabsTrigger>
          <TabsTrigger value="overlays">오버레이</TabsTrigger>
        </TabsList>

        {/* Buttons Tab */}
        <TabsContent value="buttons" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>버튼 (AC-4 검증)</CardTitle>
              <CardDescription>Primary 색상 #5B5FC7 (Indigo) 확인</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Button>Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="link">Link</Button>
              </div>

              <Separator />

              <div className="flex flex-wrap gap-2">
                <Button size="sm">Small</Button>
                <Button size="default">Default</Button>
                <Button size="lg">Large</Button>
                <Button size="icon"><Plus className="h-4 w-4" /></Button>
              </div>

              <Separator />

              <div className="flex flex-wrap gap-2">
                <Button disabled>Disabled</Button>
                <Button disabled>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading
                </Button>
              </div>

              <Separator />

              <div>
                <h4 className="text-sm font-medium mb-2">AI 버튼 (그라디언트)</h4>
                <div className="flex flex-wrap gap-2">
                  <AIButton onClick={handleAIClick} loading={aiLoading}>
                    AI 요약
                  </AIButton>
                  <AIButton variant="outline">AI 제안</AIButton>
                  <AIButton variant="ghost">AI 분류</AIButton>
                  <AIButton size="sm">Small AI</AIButton>
                  <AIButton disabled>Disabled AI</AIButton>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Inputs Tab */}
        <TabsContent value="inputs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>입력 필드</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Input</label>
                  <Input placeholder="텍스트를 입력하세요..." />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Disabled Input</label>
                  <Input placeholder="비활성화됨" disabled />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Textarea</label>
                <Textarea placeholder="긴 텍스트를 입력하세요..." />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Select</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="옵션 선택..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">높음</SelectItem>
                    <SelectItem value="medium">보통</SelectItem>
                    <SelectItem value="low">낮음</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Feedback Tab */}
        <TabsContent value="feedback" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Alert</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>정보</AlertTitle>
                <AlertDescription>
                  이것은 정보 메시지입니다.
                </AlertDescription>
              </Alert>

              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>오류</AlertTitle>
                <AlertDescription>
                  이것은 오류 메시지입니다.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Toast</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Button onClick={() => toast("기본 토스트 메시지")}>
                Default Toast
              </Button>
              <Button onClick={() => toast.success("성공적으로 완료되었습니다!")}>
                Success Toast
              </Button>
              <Button onClick={() => toast.error("오류가 발생했습니다.")}>
                Error Toast
              </Button>
              <Button onClick={() => toast.warning("경고 메시지입니다.")}>
                Warning Toast
              </Button>
              <Button onClick={() => toast.info("정보 메시지입니다.")}>
                Info Toast
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Skeleton</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Custom Components Tab */}
        <TabsContent value="custom" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Priority Badge (AC-3 검증)</CardTitle>
              <CardDescription>우선순위 뱃지 - HIGH/MEDIUM/LOW</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <PriorityBadge priority="HIGH" />
              <PriorityBadge priority="MEDIUM" />
              <PriorityBadge priority="LOW" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Label Tag (AC-3 검증)</CardTitle>
              <CardDescription>라벨 태그 - 프리셋 및 커스텀 색상</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <LabelTag label="Bug" preset="bug" />
                <LabelTag label="Feature" preset="feature" />
                <LabelTag label="Enhancement" preset="enhancement" />
                <LabelTag label="Docs" preset="docs" />
              </div>
              <div className="flex flex-wrap gap-2">
                <LabelTag label="Removable" preset="bug" removable onRemove={() => toast("라벨 제거됨")} />
                <LabelTag label="Custom Color" bgColor="#E0F2FE" textColor="#0369A1" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Badge & Avatar</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge>Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="destructive">Destructive</Badge>
                <Badge variant="outline">Outline</Badge>
              </div>

              <Separator />

              <div className="flex flex-wrap gap-2">
                <Avatar>
                  <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <Avatar>
                  <AvatarFallback className="bg-primary text-primary-foreground">JL</AvatarFallback>
                </Avatar>
                <Avatar>
                  <AvatarFallback className="bg-column-progress text-white">IP</AvatarFallback>
                </Avatar>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Overlays Tab */}
        <TabsContent value="overlays" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Dialog & Sheet</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button>Open Dialog</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>다이얼로그 제목</DialogTitle>
                    <DialogDescription>
                      이것은 다이얼로그 설명입니다.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <p>다이얼로그 내용이 여기에 표시됩니다.</p>
                  </div>
                </DialogContent>
              </Dialog>

              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline">Open Sheet</Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>시트 제목</SheetTitle>
                    <SheetDescription>
                      이것은 시트 설명입니다.
                    </SheetDescription>
                  </SheetHeader>
                  <div className="py-4">
                    <p>시트 내용이 여기에 표시됩니다.</p>
                  </div>
                </SheetContent>
              </Sheet>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost">Hover for Tooltip</Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>툴팁 내용</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
