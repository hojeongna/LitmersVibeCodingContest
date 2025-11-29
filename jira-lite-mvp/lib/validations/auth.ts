import { z } from "zod";

export const signUpSchema = z.object({
  email: z.string().email("유효한 이메일을 입력하세요").max(255),
  password: z.string().min(6, "비밀번호는 6자 이상이어야 합니다").max(100),
  name: z.string().min(1, "이름을 입력하세요").max(50, "이름은 50자 이내로 입력하세요"),
});

export const loginSchema = z.object({
  email: z.string().email("유효한 이메일을 입력하세요"),
  password: z.string().min(1, "비밀번호를 입력하세요"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("유효한 이메일을 입력하세요"),
});

export const resetPasswordSchema = z.object({
  password: z.string().min(6, "비밀번호는 6자 이상이어야 합니다").max(100),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "비밀번호가 일치하지 않습니다",
  path: ["confirmPassword"],
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "현재 비밀번호를 입력하세요"),
  newPassword: z.string().min(6, "새 비밀번호는 6자 이상이어야 합니다").max(100),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "비밀번호가 일치하지 않습니다",
  path: ["confirmPassword"],
});

export const profileSchema = z.object({
  name: z.string().min(1, "이름을 입력하세요").max(50, "이름은 50자 이내로 입력하세요"),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
