const mongoose = require('mongoose');

const cubeSchema = new mongoose.Schema({
  date: {type: Date, default: Date.now},
  time: {type: Number, required: true},
  solves: [{type: Number, required: true}],
  author: {type: String, required: true},
  event: {type: String, enum: ['333', 'OH'], required: true}
});

module.exports = {Cube: mongoose.model('Cube', cubeSchema)};
