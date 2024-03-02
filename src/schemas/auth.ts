import { z } from "zod";

export const types = ["satyam-admin", "satyam-chief-editor", "satyam-member", "reviewer", "author"] as const;

export const otpSchema = z.object({ email: z.string().email() });

export const loginSchema = otpSchema.extend({ password: z.string().min(8) });

export const signupSchema = loginSchema.extend({
  fname: z.string().min(1).max(20),
  lname: z.string().min(1).max(20),
  mobile: z.string().length(10),
  type: z.enum(types),
});

export const forgotSchema = loginSchema.extend({ otp: z.string().length(6) });
