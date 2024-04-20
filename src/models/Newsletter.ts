import { InferSchemaType, Schema, model } from "mongoose";

const newsletterSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
  },
  { _id: false }
);

export default model("newsletter", newsletterSchema);

export type NewsletterType = InferSchemaType<typeof newsletterSchema>;
