import { InferSchemaType, Schema, model } from "mongoose";
import { announcementTypes } from "../constants";

const announcementSchema = new Schema(
  {
    type: { type: String, enum: announcementTypes, default: "announcement" },
    subject: { type: String, required: true },
    description: { type: String, required: true },
    links: { type: [String], default: [] },
  },
  { timestamps: true }
);

export default model("announcement", announcementSchema);

export type AnnouncementType = InferSchemaType<typeof announcementSchema>;
