const mongoose = require('mongoose');
const {events: availableEvents} = require('../config.js');

const SquadSchema = new mongoose.Schema({
  author: {type: [String]},
  event: {type: String, enum: availableEvents, required: true, unique: true}
});

module.exports = {Squad: mongoose.model('Squad', SquadSchema)};
