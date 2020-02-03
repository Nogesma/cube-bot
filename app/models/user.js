const mongoose = require('mongoose');
const { events: availableEvents } = require('../config');

const userSchema = new mongoose.Schema({
  single: { type: Number, required: true },
  average: { type: Number, required: true },
  singleDate: { type: Date, default: Date.now },
  averageDate: { type: Date, default: Date.now },
  author: { type: String, required: true },
  event: { type: String, enum: availableEvents, require: true },
});

module.exports = { User: mongoose.model('User', userSchema) };
