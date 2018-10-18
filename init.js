const R = require('ramda');
const mongoose = require('mongoose');
const {saveCustomFields} = require('../app/models/custom-fields-db');
mongoose.Promise = require('bluebird');

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

if (process.env.NODE_ENV === 'development') {
  require('dotenv').config();
}

mongoose.connect(process.env.MONGO_DB, {useNewUrlParser: true});

const cf = [
  {
    name: 'tf_fr',
    nlpCore: 'rasa',
    fields: {
      language: 'fr',
      pipeline: 'tensorflow_embedding'
    }
  },
  {
    name: 'tf_en',
    nlpCore: 'rasa',
    fields: {
      language: 'en',
      pipeline: 'tensorflow_embedding'
    }
  }
];

R.map(saveCustomFields, cf);
// TODO highly unsafe change it to Promise awaiting
setTimeout(() => mongoose.disconnect(), 10000);
