import { z } from "zod";

export const CreatePropertySchema = z.object({
  sellerId: z.string().min(1),
  title: z.string().optional(),
  description: z.string().min(10),
  price: z.number().min(0),
  location: z.string().min(2),
  type: z.enum(["apartment", "villa", "plot"]),
  status: z.enum(["active", "sold", "inactive"]).default("active"),
});
export const GetPropertySchema = z.object({
  sellerId: z.string().min(1),
  minPrice: z.number().min(1),
  maxPrice: z.number().min(1),
  type: z.string().min(1),
  price: z.number().min(0),
  location: z.string().min(2),
});

export type CreateProperty = z.infer<typeof CreatePropertySchema>;
export type GetProperty = z.infer<typeof GetPropertySchema>;
