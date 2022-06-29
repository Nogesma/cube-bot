import mongoose from "mongoose";
import { events as availableEvents } from "../config.js";

const userSchema = new mongoose.Schema({
  pb: [
    {
      event: { type: String, enum: availableEvents },
      single: { type: Number },
      average: { type: Number },
      singleDate: { type: Date },
      averageDate: { type: Date },
    },
  ],
  author: { type: String, required: true },
  apiKey: { type: String },
});

export default mongoose.model("User", userSchema);
