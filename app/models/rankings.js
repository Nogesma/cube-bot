const mongoose = require('mongoose');
const { events: availableEvents } = require('../config');

const rankingsSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  author: { type: String, required: true },
  score: { type: Number, default: 0 },
  event: { type: String, enum: availableEvents, require: true },
  attendances: { type: Number, default: 0 },
});

module.exports = { Ranking: mongoose.model('Ranking', rankingsSchema) };
