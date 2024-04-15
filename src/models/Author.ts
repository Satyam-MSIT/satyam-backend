import { InferSchemaType, Schema, model } from "mongoose";

const authorSchema = new Schema({});

export default model("author", authorSchema);

export type AuthorType = InferSchemaType<typeof authorSchema>;
