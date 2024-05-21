import { InferSchemaType, Schema, model } from "mongoose";
import { volumeTypes } from "../constants";

const volumeSchema = new Schema(
  {
    number: { type: String, required: true, unique: true, minLength: 5, maxLength: 5 },
    title: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    status: { type: String, enum: volumeTypes, default: "accepting" },
    keywords: { type: [String], required: true },
    acceptanceTill: { type: Date, required: true },
    publishDate: { type: Date, required: true },
    acceptancePing: { type: Number, default: 5 },
    reviewPing: { type: Number, default: 5 },
  },
  { timestamps: true }
);

export default model("volume", volumeSchema);

export type VolumeType = InferSchemaType<typeof volumeSchema>;
