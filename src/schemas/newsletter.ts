import { z } from "zod";
import { announcementTypes } from "../constants";

export const subscribeSchema = z.object({
  name: z.string(),
  email: z.string().email(),
});

export const unsubscribeSchema = z.object({ email: z.string().email() });

export const announcementSchema = z.object({
  type: z.enum(announcementTypes).optional(),
  subject: z.string(),
  html: z.string(),
});
