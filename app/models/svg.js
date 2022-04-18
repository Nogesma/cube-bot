import mongoose from "mongoose";
import { events as availableEvents } from "../config.js";

const svgSchema = new mongoose.Schema({
  date: { type: String },
  svg: [{ type: String }],
  event: { type: String, enum: availableEvents, required: true },
});

export default mongoose.model("Svg", svgSchema);
