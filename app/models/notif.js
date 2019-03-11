const mongoose = require('mongoose');
const {hours} = require('../config');

const SquadSchema = new mongoose.Schema({
  authors: [String],
  event: {type: Number, enum: hours, unique: true}
});

module.exports = {Squad: mongoose.model('Squad', SquadSchema)};
