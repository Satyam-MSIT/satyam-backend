import { InferSchemaType, Schema, Types, model } from "mongoose";
import { reviewerSchema } from "./Reviewer";
import { types } from "../constants";

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    mobile: { type: String },
    password: { type: String, required: true },
    lastPasswordModifiedAt: { type: Number, default: Date.now },
    type: { type: String, required: true, enum: types },
    image: { type: String },
    active: { type: Boolean, default: true },
    confirmed: { type: Boolean, default: false },
    journal_ids: [{ type: [Types.ObjectId], default: [], ref: "journal" }],
    // author_id: { type: Types.ObjectId, ref: "author" },
    reviewer: reviewerSchema,
    satyam_id: { type: Types.ObjectId, ref: "satyam" },
  },
  { timestamps: true }
);

export default model("user", userSchema);

export type UserType = { id?: string } & InferSchemaType<typeof userSchema>;
