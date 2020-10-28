import mongoose from 'mongoose';
import { events as availableEvents } from '../config.js';

const rankingsSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  author: { type: String, required: true },
  score: { type: Number, default: 0 },
  event: { type: String, enum: availableEvents, require: true },
  attendances: { type: Number, default: 0 },
});

export default mongoose.model('Ranking', rankingsSchema);
