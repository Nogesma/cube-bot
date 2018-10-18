const R = require('ramda');
const mongoose = require('mongoose');
const {events} = require('./app/config');
mongoose.Promise = require('bluebird');

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

if (process.env.NODE_ENV === 'development') {
  require('dotenv').config();
}

mongoose.connect(process.env.MONGO_DB, {useNewUrlParser: true});

const myEvents = events.map(event => ({event, authorList: []}));

R.map(saveCustomFields, cf);
setTimeout(() => mongoose.disconnect(), 10000);
