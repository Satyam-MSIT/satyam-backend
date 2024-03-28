import { Schema, model } from "mongoose";

const contactSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, lowercase: true },
  message: { type: String, required: true },
});

export default model("contact", contactSchema);
