import { z } from "zod";
import { types } from "../constants";

export const editSchema = z.object({
  name: z.string().optional(),
  type: z.enum(types).optional(),
  active: z.boolean().optional(),
});
