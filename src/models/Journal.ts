import { Schema, model } from "mongoose";

const journalSchema = new Schema(
  {
    status: { type: String, default: "", enum: [""] },
    title: { type: String, required: true },
    description: String,
    link: { type: String, required: true },
    comments: [
      {
        status: { type: String, default: "", enum: [""] },
        message: { type: String, required: true },
        time: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export default model("journal", journalSchema);
