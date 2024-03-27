import { Date, Schema, model } from "mongoose";
import { types } from "../schemas/auth";

export type User = {
  id: string;
  name: string;
  email: string;
  password: string;
  lastPasswordModifiedAt: Date
  type: (typeof types)[number];
  confirmed: boolean;
};

const userSchema = new Schema<User>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    lastPasswordModifiedAt: { type: Date, default: Date.now },
    type: { type: String, required: true, enum: types },
    confirmed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default model("user", userSchema);
