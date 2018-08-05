const mongoose = require('mongoose');

const cubeSchema = new mongoose.Schema({
  date: {type: Date, default: Date.now},
  time: {type: Number, required: true},
  author: {type: String, required: true}
});

module.exports = {Cube: mongoose.model('Cube', cubeSchema)};
