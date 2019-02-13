const mongoose = require('mongoose');
const Bromise = require('bluebird');
const {Squad} = require('./app/models/notif');

const events = process.argv.slice(2);

mongoose.Promise = Bromise;

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

if (process.env.NODE_ENV === 'development') {
  require('dotenv').config();
}

mongoose.set('useCreateIndex', true);

mongoose.connect(process.env.MONGO_URL, {useNewUrlParser: true});

const myEvents = events.map(event => ({event, authorList: []}));

const saveEvents = events => new Squad(events).save();

Bromise.map(myEvents, saveEvents).then(() => mongoose.disconnect());
