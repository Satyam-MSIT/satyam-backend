import { Schema, Types, model } from "mongoose";

const reviewerSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  // ? Ask question whether to keep it or not if keep it internal schema
  about: { type: String, required: true },
  journal_id: { type: [Types.ObjectId], default: [] },
});

export default model("reviewer", reviewerSchema);
