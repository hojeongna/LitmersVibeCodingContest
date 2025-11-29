import { z } from 'zod';

export const createIssueSchema = z.object({
  title: z.string().min(1, '제목은 필수입니다').max(200, '제목은 최대 200자까지 입력 가능합니다'),
  description: z.string().max(5000, '설명은 최대 5000자까지 입력 가능합니다').optional().or(z.literal('')),
  priority: z.enum(['HIGH', 'MEDIUM', 'LOW']).default('MEDIUM'),
  assigneeId: z.string().uuid().optional().nullable(),
  dueDate: z.string().optional().nullable(),
  labelIds: z.array(z.string().uuid()).max(5, '이슈당 최대 5개의 라벨만 추가할 수 있습니다').optional(),
});

export const updateIssueSchema = createIssueSchema.partial().extend({
  statusId: z.string().uuid().optional(),
});

export type CreateIssueInput = z.infer<typeof createIssueSchema>;
export type UpdateIssueInput = z.infer<typeof updateIssueSchema>;
