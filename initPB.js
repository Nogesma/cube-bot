const mongoose = require('mongoose');
const Bromise = require('bluebird');
const R = require('ramda');
const { Cube } = require('./app/models/cubes');
const { User } = require('./app/models/user');
const { events } = require('./app/config');
const { getBestTime } = require('./app/tools/calculators');

mongoose.Promise = Bromise;

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

if (process.env.NODE_ENV === 'development') {
  require('dotenv').config();
}

mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const getUserID = async () => Cube.find({}, { author: 1, _id: 0 }).exec();

const getTimes = async ([author, event]) => Cube.find({ author, event }).exec();

const getDates = async ({ author, event, single, average }) => ({
  singleDate: R.prop(
    'date',
    await Cube.findOne({ author, event, single }, { date: 1, _id: 0 }).exec()
  ),
  averageDate: R.prop(
    'date',
    await Cube.findOne({ author, event, average }, { date: 1, _id: 0 }).exec()
  ),
  author,
  event,
  single,
  average,
});

const removeDuplicates = (x) => [...new Set(x)];

const getPB = (t) => ({
  single: getBestTime(R.map(R.prop('single'), t)),
  average: getBestTime(R.map(R.prop('average'), t)),
});

const getUserList = async () =>
  R.pipe(
    getUserID,
    R.andThen(R.map(R.prop('author'))),
    R.andThen(removeDuplicates),
    R.andThen(R.map((x) => R.map((y) => [x, y], events))),
    R.andThen(R.unnest)
  )();

const getUserData = async () =>
  R.pipe(
    getUserList,
    R.andThen(
      R.map(([userID, e]) =>
        R.pipe(
          getTimes,
          R.andThen(getPB),
          R.andThen(R.mergeLeft({ author: userID, event: e })),
          R.andThen(getDates)
        )([userID, e])
      )
    )
  )();

const saveUser = (s) => new User(s).save();

Bromise.map(getUserData(), saveUser).then(() => mongoose.disconnect());
