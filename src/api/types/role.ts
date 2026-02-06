import { z } from "zod";

export const CreateRoleSchema = z.object({
  name: z.string().min(1),
  description: z.string().default(""),
  isActive: z.boolean().default(true),
});

export type CreateRole = z.infer<typeof CreateRoleSchema>;
