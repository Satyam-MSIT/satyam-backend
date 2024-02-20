import { z } from "zod";

export const addSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
});
