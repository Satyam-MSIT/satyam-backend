import { Schema, model } from "mongoose";

const journalSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "user" },
    status: { type: String, default: "", enum: [""] },
    title: { type: String, required: true },
    description: String,
    link: { type: String, required: true },
    name: { type: String, required: true },
    filename: { type: String, required: true },
    size: { type: Number, required: true },
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
