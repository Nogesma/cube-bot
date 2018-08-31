const mongoose = require('mongoose');
const {events: availableEvents} = require('../config.js');

const rankingsSchema = new mongoose.Schema({
  date: {type: Date, default: Date.now},
  author: {type: String, required: true},
  score: {type: Number, default: 0},
  wins: {type: Number, default: 0},
  podiums: {type: Number, default: 0},
  event: {type: String, enum: availableEvents, require: true}
});

module.exports = {Ranking: mongoose.model('Ranking', rankingsSchema)};

