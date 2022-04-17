import mongoose from "mongoose";
import { hours } from "../config.js";

const SquadSchema = new mongoose.Schema({
  authors: [String],
  event: { type: Number, enum: hours, unique: true },
});

export default mongoose.model("Squad", SquadSchema);
