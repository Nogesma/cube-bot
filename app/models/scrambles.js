import mongoose from 'mongoose';
import { events as availableEvents } from '../config.js';

const scramblesSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  scrambles: [{ type: String, required: true }],
  event: { type: String, enum: availableEvents, required: true },
});

export default mongoose.model('Scrambles', scramblesSchema);
