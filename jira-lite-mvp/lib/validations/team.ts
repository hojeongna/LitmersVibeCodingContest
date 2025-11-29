import { z } from "zod";

// Team creation schema
export const createTeamSchema = z.object({
  name: z
    .string()
    .min(1, "팀 이름을 입력하세요")
    .max(50, "팀 이름은 50자 이내로 입력하세요")
    .trim(),
});

export type CreateTeamInput = z.infer<typeof createTeamSchema>;

// Team update schema
export const updateTeamSchema = z.object({
  name: z
    .string()
    .min(1, "팀 이름을 입력하세요")
    .max(50, "팀 이름은 50자 이내로 입력하세요")
    .trim()
    .optional(),
});

export type UpdateTeamInput = z.infer<typeof updateTeamSchema>;

// Team member role schema
export const teamRoleSchema = z.enum(["OWNER", "ADMIN", "MEMBER"]);

export type TeamRoleInput = z.infer<typeof teamRoleSchema>;
