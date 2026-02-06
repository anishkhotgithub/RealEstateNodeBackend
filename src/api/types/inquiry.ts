import { z } from "zod";

export const CreateInquirySchema = z.object({
  propertyId: z.string(),
  buyerId: z.string(),
  message: z.string().default(""),
  status: z.string().default("pending"),
});
export const GetInquirySchema = z.object({
  propertyId: z.string(),
  buyerId: z.string(),
  offset: z.number().default(0),
  limit: z.number().default(10),
  message: z.string().default(""),
  status: z.string().default("pending"),
});

export type CreateInquiry = z.infer<typeof CreateInquirySchema>;
