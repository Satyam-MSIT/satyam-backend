import { z } from "zod";

export const volumeSchema = z.object({
  number: z.number().gte(1).lte(99).optional(),
  title: z.string(),
  description: z.string(),
  keywords: z.string().array(),
  acceptanceTill: z.date(),
  publishDate: z.date(),
  acceptancePing: z.number().optional(),
  reviewPing: z.number().optional(),
});
