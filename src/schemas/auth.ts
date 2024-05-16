import { z } from "zod";
import { userTypes } from "../constants";

export const otpSchema = z.object({ email: z.string().email() });

export const loginSchema = otpSchema.extend({ password: z.string().min(8) });

export const signupSchema = loginSchema.extend({
  name: z.string().min(1).max(50),
  type: z.enum(userTypes),
  mobile: z.string().optional(),
});

export const forgotSchema = loginSchema.extend({ otp: z.string().length(6) });

export const editSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  mobile: z.string().optional(),
});
