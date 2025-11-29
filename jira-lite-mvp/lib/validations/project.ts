import { z } from 'zod';

// 프로젝트 생성 스키마
export const createProjectSchema = z.object({
  name: z
    .string()
    .min(1, '프로젝트 이름은 필수입니다')
    .max(100, '프로젝트 이름은 최대 100자까지 입력 가능합니다'),
  description: z
    .string()
    .max(2000, '프로젝트 설명은 최대 2000자까지 입력 가능합니다')
    .optional()
    .or(z.literal('')),
  teamId: z.string().uuid('유효한 팀 ID가 필요합니다'),
  key: z
    .string()
    .min(2, '프로젝트 키는 최소 2자 이상이어야 합니다')
    .max(10, '프로젝트 키는 최대 10자까지 입력 가능합니다')
    .regex(/^[A-Z]+$/, '프로젝트 키는 대문자 영문만 가능합니다')
    .optional(),
});

// 프로젝트 수정 스키마
export const updateProjectSchema = z.object({
  name: z
    .string()
    .min(1, '프로젝트 이름은 필수입니다')
    .max(100, '프로젝트 이름은 최대 100자까지 입력 가능합니다')
    .optional(),
  description: z
    .string()
    .max(2000, '프로젝트 설명은 최대 2000자까지 입력 가능합니다')
    .optional()
    .or(z.literal('')),
});

// 타입 추론
export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
