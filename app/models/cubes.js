const mongoose = require('mongoose');
const { events: availableEvents } = require('../config');

const cubeSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  average: { type: Number, required: true },
  solves: [{ type: String, required: true }],
  single: { type: Number, required: true },
  author: { type: String, required: true },
  event: { type: String, enum: availableEvents, required: true },
});

module.exports = { Cube: mongoose.model('Cube', cubeSchema) };
