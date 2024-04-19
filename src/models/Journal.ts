import { InferSchemaType, Schema, Types, model } from "mongoose";

export const journalSchema = new Schema(
  {
    journal_id: { type: String, required: true, unique: true },
    resubmission_id: { type: String },
    title: { type: String },
    abstract: { type: String },
    status: {
      type: String,
      default: "review-chief-editor",
      enum: [
        "accepted",
        "accepted-minor", //accepted with minor changes
        "accepted-major", //accepted with major changes
        "rejected",
        "under-review", // under review by the reviewer
        "review-chief-editor", // just submitted to satyam team
        "waiting-reviewer", //waiting for reviewer to allocated
        "final",
      ],
    },
    keywords: { type: [String] },
    author_id: { type: Types.ObjectId, ref: "user" },
    author_name: { type: String },
    author_reviewers: {
      type: [String],
      default: [],
      validate: {
        validator: (value: string[]) => value.length >= 3,
      },
    },
    reviewers: {
      type: [
        {
          name: { type: String },
          email: { type: String },
          status: { type: String, default: "pending", enum: ["accepted", "rejected", "pending"] },
        },
      ],
    },
    versions: {
      type: [
        {
          link: { type: String, required: true },
          name: { type: String, required: true },
          filename: { type: String, required: true },
          comments: {
            type: [
              {
                email: String,
                status: { type: String, required: true, enum: ["working", "accepted", "accepted-minor", "accepted-major", "rejected"] },
                time: { type: Date, default: Date.now },
                form: {},
              },
            ],
            default: [{ status: "working" }],
          },
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

export default model("journal", journalSchema);

export type JournalType = InferSchemaType<typeof journalSchema>;
