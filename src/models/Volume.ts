import { InferSchemaType, Schema, model } from "mongoose";

const volumeSchema = new Schema(
  {
    number: { type: Number, required: true, unique: true, min: 1, max: 99 },
    title: { type: String, required: true, unique: true },
    description: { type: String, required: true },
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
