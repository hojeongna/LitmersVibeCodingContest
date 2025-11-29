"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { updateTeamSchema, type UpdateTeamInput } from "@/lib/validations/team";
import { useUpdateTeam } from "@/hooks/use-teams";
import { TeamWithRole } from "@/types/team";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TeamSettingsFormProps {
  team: TeamWithRole;
}

export function TeamSettingsForm({ team }: TeamSettingsFormProps) {
  const [charCount, setCharCount] = useState(team.name.length);
  const updateTeam = useUpdateTeam();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    watch,
  } = useForm<UpdateTeamInput>({
    resolver: zodResolver(updateTeamSchema),
    defaultValues: {
      name: team.name,
    },
  });

  // Watch name field for character count
  const nameValue = watch("name");
  useEffect(() => {
    setCharCount(nameValue?.length || 0);
  }, [nameValue]);

  const onSubmit = async (data: UpdateTeamInput) => {
    if (!data.name) {
      toast.error("팀 이름을 입력하세요");
      return;
    }

    try {
      await updateTeam.mutateAsync({
        teamId: team.id,
        data: { name: data.name },
      });
      toast.success("팀 정보가 수정되었습니다");
      reset({ name: data.name }); // Reset form with new values
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "팀 수정에 실패했습니다"
      );
    }
  };

  const handleCancel = () => {
    reset();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">
          팀 이름 <span className="text-destructive">*</span>
        </Label>
        <Input
          id="name"
          placeholder="팀 이름을 입력하세요"
          {...register("name")}
          disabled={updateTeam.isPending}
          className={errors.name ? "border-destructive" : ""}
        />
        <div className="flex items-center justify-between">
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name.message}</p>
          )}
          <p
            className={`text-xs ml-auto ${
              charCount > 50 ? "text-destructive" : "text-muted-foreground"
            }`}
          >
            {charCount}/50
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={handleCancel}
          disabled={!isDirty || updateTeam.isPending}
        >
          취소
        </Button>
        <Button
          type="submit"
          disabled={!isDirty || updateTeam.isPending}
        >
          {updateTeam.isPending && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          변경사항 저장
        </Button>
      </div>
    </form>
  );
}
