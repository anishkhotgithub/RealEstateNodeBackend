import { z } from "zod";

export const CreateAppointmentSchema = z.object({
  propertyId: z.string(),
  buyerId: z.string(),
  sellerId: z.string(),
  date: z.date(),
  status: z.string().default("scheduled"),
});
export const GetAppointmentSchema = z.object({
  propertyId: z.string(),
  buyerId: z.string(),
  sellerId: z.string(),
  date: z.date(),
});

export type CreateAppointment = z.infer<typeof CreateAppointmentSchema>;
