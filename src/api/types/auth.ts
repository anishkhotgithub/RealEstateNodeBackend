import { z } from "zod";

export const CreateAuthSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  role: z.string(),
  password: z.string().min(6),
  isActive: z.boolean().default(true),
  isDeleted: z.boolean().default(false),
  isEdited: z.boolean().default(false),
});
export const GetAuthSchema = z.object({
  email: z.string().email(),
});
export const UpdateAuthSchema = z.object({
  _id: z.string(),
  name: z.string().min(1),
  email: z.string().email(),
  roles: z.string(),
  password: z.string().min(6),
});
export const DeleteAuthSchema = z.object({
  _id: z.string(),
});
export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export type CreateAuth = z.infer<typeof CreateAuthSchema>;
export type GetAuth = z.infer<typeof GetAuthSchema>;
export type UpdateAuth = z.infer<typeof UpdateAuthSchema>;
export type DeleteAuth = z.infer<typeof DeleteAuthSchema>;
export type Login = z.infer<typeof LoginSchema>;
