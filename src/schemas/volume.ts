import { z } from "zod";

export const volumeSchema = z.object({
  number: z.string().length(5),
  title: z.string(),
  description: z.string(),
  keywords: z.array(z.string()),
  acceptanceTill: z
    .string()
    .refine((date) => {
      const regex = /^\d{4}-\d{2}-\d{2}$/;
      return regex.test(date);
    })
    .optional(),
  publishDate: z
    .string()
    .refine((date) => {
      const regex = /^\d{4}-\d{2}-\d{2}$/;
      return regex.test(date);
    })
    .optional(),
  acceptancePing: z.number().optional(),
  reviewPing: z.number().optional(),
});
