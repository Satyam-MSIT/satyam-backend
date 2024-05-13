import { z } from "zod";

export const draftSchema = z.object({
  journal_id: z.string().optional(),
  abstract: z.string().optional(),
  title: z.string().optional(),
  uploadFile: z.enum(["new", "keep", "delete"]),
  keywords: z.array(z.string()).optional(),
  corresponding_author: z.string().email().optional(),
  authors: z
    .array(
      z.object({
        name: z.string(),
        email: z.string().email(),
      })
    )
    .optional(),
  reviewers: z
    .array(
      z.object({
        name: z.string(),
        email: z.string().email(),
      })
    )
    .optional(),
});

export const finalSchema = z.object({ journal_id: z.string() });

export const submitSchema = z.object({
  journal_id: z.string().optional(),
  abstract: z.string(),
  title: z.string(),
  keywords: z.array(z.string()),
  corresponding_author: z.string().email(),
  authors: z.array(z.object({ name: z.string(), email: z.string().email() })),
  reviewers: z.array(z.object({ name: z.string(), email: z.string().email() })),
});
