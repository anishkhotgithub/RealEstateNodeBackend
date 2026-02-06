import { z } from "zod";

export const CreateSellerSchema = z.object({
  userId: z.string().min(1),
  businessName: z.string().optional(),
  phone: z.string().min(10),
  address: z.string(),
  city: z.string().min(2),
  state: z.string().min(2),
  country: z.string().min(2),
  pincode: z.string().min(2),
  isApproved: z.boolean().default(false),
  isPaid: z.boolean().default(false),
  kycStatus: z.string().default("pending"),
  subscriptionPlan: z.string().default("free"),
  subscriptionExpiry: z.date(),
  totalListings: z.number().default(0),
  activeListings: z.number().default(0),
});
export const GetSellerSchema = z.object({
  userId: z.string().min(1),
});

export type CreateSeller = z.infer<typeof CreateSellerSchema>;
export type GetSeller = z.infer<typeof GetSellerSchema>;
