import { Schema, model } from "mongoose";
import { types } from "../schemas/auth";

export type User = {
  id: string;
  name: string;
  email: string;
  mobile: string;
  password: string;
  type: (typeof types)[number];
  confirmed: boolean;
};

const userSchema = new Schema<User>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    mobile: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    type: { type: String, required: true, enum: types },
    confirmed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default model("user", userSchema);
