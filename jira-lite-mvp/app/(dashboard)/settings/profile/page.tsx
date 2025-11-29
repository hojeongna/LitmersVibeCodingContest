"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";
import { updateUserProfile } from "@/lib/firebase/auth";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Camera, Lock } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

const profileSchema = z.object({
  name: z.string().min(1, "이름을 입력하세요").max(50, "이름은 50자 이내로 입력하세요"),
});

type ProfileInput = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.displayName || "",
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("파일 크기는 5MB 이하여야 합니다");
      return;
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      toast.error("이미지 파일만 업로드 가능합니다");
      return;
    }

    setSelectedFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const onSubmit = async (data: ProfileInput) => {
    if (!user) return;

    setIsLoading(true);

    try {
      let avatarUrl = user.photoURL;

      // Upload avatar if selected
      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);

        const response = await fetch("/api/users/avatar", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error?.message || "이미지 업로드에 실패했습니다");
        }

        const result = await response.json();
        avatarUrl = result.data.url;
      }

      // Update user profile in Firebase Auth
      await updateUserProfile({
        displayName: data.name,
        ...(avatarUrl && { photoURL: avatarUrl }),
      });

      // Force token refresh to get new claims (photoURL)
      const newToken = await user.getIdToken(true);
      
      // Update cookie
      document.cookie = `firebase-auth-token=${newToken}; path=/; max-age=3600; SameSite=Lax`;

      // Sync to Supabase
      await fetch('/api/auth/sync-profile', {
        method: 'POST',
      });

      toast.success("프로필이 저장되었습니다");
      setSelectedFile(null);
      setAvatarPreview(null);
      router.refresh();
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error("프로필 업데이트에 실패했습니다");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    reset();
    setSelectedFile(null);
    setAvatarPreview(null);
  };

  const currentAvatarUrl = avatarPreview || user?.photoURL;
  const userInitials = (user?.displayName || user?.email || "U")
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const isOAuthUser = user?.providerData?.[0]?.providerId === "google.com";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">프로필 설정</h1>
        <p className="text-muted-foreground mt-1">
          프로필 정보와 보안 설정을 관리하세요
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Profile Photo */}
        <Card>
          <CardHeader>
            <CardTitle>프로필 사진</CardTitle>
            <CardDescription>
              JPG, PNG 형식의 이미지 파일 (최대 5MB)
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center gap-6">
            <Avatar className="h-24 w-24">
              {currentAvatarUrl && <AvatarImage src={currentAvatarUrl} alt="Profile" />}
              <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div>
              <Label htmlFor="avatar" className="cursor-pointer">
                <div className="flex items-center gap-2 px-4 py-2 border border-input bg-background rounded-md hover:bg-accent hover:text-accent-foreground transition-colors">
                  <Camera className="h-4 w-4" />
                  <span>사진 업로드</span>
                </div>
                <Input
                  id="avatar"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </Label>
              {selectedFile && (
                <p className="text-sm text-muted-foreground mt-2">
                  선택된 파일: {selectedFile.name}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle>개인 정보</CardTitle>
            <CardDescription>기본 프로필 정보를 관리합니다</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">이름 *</Label>
              <Input
                id="name"
                placeholder="이름을 입력하세요"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className="pr-10"
                />
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground">
                이메일은 변경할 수 없습니다
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading || !isDirty}
          >
            취소
          </Button>
          <Button type="submit" disabled={isLoading || (!isDirty && !selectedFile)}>
            {isLoading ? "저장 중..." : "변경사항 저장"}
          </Button>
        </div>
      </form>

      {/* Security Section */}
      <Card>
        <CardHeader>
          <CardTitle>보안</CardTitle>
          <CardDescription>비밀번호 및 계정 보안을 관리합니다</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">비밀번호</p>
              {isOAuthUser ? (
                <p className="text-sm text-muted-foreground">
                  Google 계정으로 로그인하여 비밀번호 변경이 불가합니다
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  정기적으로 비밀번호를 변경하세요
                </p>
              )}
            </div>
            <Button variant="outline" disabled={isOAuthUser}>
              비밀번호 변경
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/50 bg-destructive/5">
        <CardHeader>
          <CardTitle className="text-destructive">위험 영역</CardTitle>
          <CardDescription>
            이 작업은 되돌릴 수 없습니다. 신중하게 진행하세요.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-medium text-destructive">계정 삭제</p>
              <p className="text-sm text-muted-foreground mt-1">
                계정과 모든 데이터를 영구적으로 삭제합니다. 이 작업은 취소할 수 없습니다.
              </p>
            </div>
            <Button
              variant="destructive"
              onClick={() => {
                // TODO: 계정 삭제 모달 열기
                toast.error("계정 삭제 기능은 현재 개발 중입니다");
              }}
            >
              계정 삭제
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
