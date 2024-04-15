import { z } from "zod";

export const types = ["satyam-admin", "satyam-chief-editor", "satyam-member", "reviewer", "author"] as const;

export const otpSchema = z.object({ email: z.string().email() });

export const loginSchema = otpSchema.extend({ password: z.string().min(8) });

export const signupSchema = loginSchema.extend({
  name: z.string().min(1).max(50),
  type: z.enum(types),
  alternateEmail: z.string().email().optional(),
});

export const forgotSchema = loginSchema.extend({ otp: z.string().length(6) });

export type SignupData = z.infer<typeof signupSchema>;
