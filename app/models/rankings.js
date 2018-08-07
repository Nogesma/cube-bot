const mongoose = require('mongoose');

const rankingsSchema = new mongoose.Schema({
  date: {type: Date, default: Date.now},
  author: {type: String, required: true},
  score: {type: Number, default: 0},
  wins: {type: Number, default: 0},
  podiums: {type: Number, default: 0}
});

module.exports = {Ranking: mongoose.model('Ranking', rankingsSchema)};