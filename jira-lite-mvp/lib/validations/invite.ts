import { z } from "zod";

// Invite creation schema
export const createInviteSchema = z.object({
  email: z
    .string()
    .min(1, "이메일을 입력하세요")
    .email("올바른 이메일 형식이 아닙니다")
    .toLowerCase()
    .trim(),
  role: z.enum(["ADMIN", "MEMBER"], {
    errorMap: () => ({ message: "역할은 ADMIN 또는 MEMBER여야 합니다" }),
  }),
});

export type CreateInviteInput = z.infer<typeof createInviteSchema>;
