import { z } from "zod";
import { userTypes } from "../constants";

export const editSchema = z.object({
  name: z.string().optional(),
  type: z.enum(userTypes).optional(),
  active: z.boolean().optional(),
});
