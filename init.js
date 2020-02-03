const mongoose = require('mongoose');
const Bromise = require('bluebird');
const R = require('ramda');
const { Squad } = require('./app/models/notif');

mongoose.Promise = Bromise;

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

if (process.env.NODE_ENV === 'development') {
  require('dotenv').config();
}

mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);

mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true });

const myEvents = R.map((event) => ({ event, authorList: [] }), R.range(1, 24));

const saveEvents = (events) => new Squad(events).save();

Bromise.map(myEvents, saveEvents).then(() => mongoose.disconnect());
