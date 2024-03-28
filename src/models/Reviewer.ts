import { Schema, model } from "mongoose";

export const reviewerSchema = new Schema(
  {
    organization: { type: String, required: true },
    profile_link: { type: String },
    title: { type: String, required: true },
    about: { type: String, required: true },
    field_of_interest: [{ type: String }],
  },
  { _id: false }
);

// const reviewerSchema = new Schema({
//   name: { type: String, required: true },
//   email: { type: String, required: true, unique: true },
//   // ? Ask question whether to keep it or not if keep it internal schema
//   about: { type: String, required: true },
//   journal_id: { type: [Types.ObjectId], default: [] },
// });

export default model("reviewer", reviewerSchema);
