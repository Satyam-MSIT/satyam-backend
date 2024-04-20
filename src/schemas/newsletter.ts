import { z } from "zod";

export const subscribeSchema = z.object({
  name: z.string(),
  email: z.string().email(),
});

export const unsubscribeSchema = z.object({ email: z.string().email() });
