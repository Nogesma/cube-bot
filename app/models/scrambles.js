import mongoose from "mongoose";
import { events as availableEvents } from "../config.js";

const scramblesSchema = new mongoose.Schema({
  date: { type: String },
  scrambles: [{ scrambleString: String, svg: String }],
  event: { type: String, enum: availableEvents, required: true },
});

export default mongoose.model("Scrambles", scramblesSchema);
