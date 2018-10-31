const mongoose = require('mongoose');
const {events} = require('../config');

const SquadSchema = new mongoose.Schema({
  authors: [String],
  event: {type: String, enum: events, unique: true}
});

module.exports = {Squad: mongoose.model('Squad', SquadSchema)};
