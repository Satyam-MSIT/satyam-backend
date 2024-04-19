import { z } from "zod";

export const draftSchema = z.object({
  journal_id: z.string().optional(),
  abstract: z.string().optional(),
  title: z.string().optional(),
  uploadFile: z.enum(["new", "keep", "delete"]),
  keywords: z.string().array().optional(),
  reviewers: z
    .object({
      name: z.string(),
      email: z.string().email(),
    })
    .array()
    .optional(),
});

export const submitSchema = z.object({
  journal_id: z.string().optional(),
  abstract: z.string(),
  title: z.string(),
  pdf: z.string(),
  keywords: z.string().array(),
  reviewers: z.object({ name: z.string(), email: z.string().email() }).array(),
});
