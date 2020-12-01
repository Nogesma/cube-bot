import mongoose from 'mongoose';
import { events as availableEvents } from '../config.js';

const cubeSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  average: { type: Number, required: true },
  solves: [],
  single: { type: Number, required: true },
  author: { type: String, required: true },
  event: { type: String, enum: availableEvents, required: true },
});

export default mongoose.model('Cube', cubeSchema);
