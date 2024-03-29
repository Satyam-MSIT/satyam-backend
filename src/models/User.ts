import { Schema, Types, model } from "mongoose";
import { types } from "../schemas/auth";
import { reviewerSchema } from "./Reviewer";

// export type User = {
//   id: string;
//   name: string;
//   email: string;
//   password: string;
//   lastPasswordModifiedAt: Date;
//   type: (typeof types)[number];
//   confirmed: boolean;
//   // author_id?: ObjectId;
//   reviewer_id?: ObjectId;
// };

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    alternateEmail: { type: String, lowercase: true },
    password: { type: String, required: true },
    lastPasswordModifiedAt: { type: Date, default: Date.now },
    type: { type: String, default: "author", enum: types },
    confirmed: { type: Boolean, default: false },
    journal_ids: [{ type: [Types.ObjectId], default: [], ref: "journal" }],
    // author_id: { type: Types.ObjectId, ref: "author" },
    reviewer: reviewerSchema,
    satyam_id: { type: Types.ObjectId, ref: "satyam" },
  },
  { timestamps: true }
);

export default model("user", userSchema);
