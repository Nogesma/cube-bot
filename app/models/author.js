import mongoose from "mongoose";
import { events as availableEvents } from "../config.js";

const userSchema = new mongoose.Schema({
  single: { type: Number, required: true },
  average: { type: Number, required: true },
  singleDate: { type: Date },
  averageDate: { type: Date },
  author: { type: String, required: true },
  event: { type: String, enum: availableEvents, require: true },
});

export default mongoose.model("Author", userSchema);
