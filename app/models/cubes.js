const mongoose = require('mongoose');
const {events: availableEvents} = require('../config.js');

const cubeSchema = new mongoose.Schema({
  date: {type: Date, default: Date.now},
  time: {type: Number, required: true},
  solves: [{type: Number, required: true}],
  author: {type: String, required: true},
  event: {type: String, enum: availableEvents, required: true}
});

module.exports = {Cube: mongoose.model('Cube', cubeSchema)};
