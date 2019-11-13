const moment = require('moment');
const mongoose = require('mongoose');
const R = require('ramda');
const { events: availableEvents } = require('../config');
const { Cube } = require('../models/cubes');
const { Squad } = require('../models/notif');
const { Ranking } = require('../models/rankings');
const {
  averageOfFiveCalculator,
  timeToSeconds,
  secondsToTime,
  computeScore,
  getBestTime,
  sortRankings,
} = require('../tools/calculators');

mongoose.set('useCreateIndex', true).set('useUnifiedTopology', true);

mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/test', {
  useNewUrlParser: true,
  useFindAndModify: false,
});

const insertNewTimes = async ({
  channel,
  date,
  author,
  event,
  args: solves,
}) => {
  if (channel.type !== 'dm') {
    return 'Veuillez envoyer vos temps en message privé';
  }

  if (date.diff(moment('00:00', 'HH:mm'), 'minutes') < 5) {
    return 'Vous ne pouvez pas soumettre vos temps entre 23h55 et 00h05';
  }

  if (solves.length !== 5) {
    return 'Veuillez entrer 5 temps';
  }

  if (R.not(R.includes(event, availableEvents))) {
    return `Veuillez entrer un event valide : ${availableEvents}`;
  }

  const times = R.map(timeToSeconds, solves);
  const average = averageOfFiveCalculator(times);
  const best = getBestTime(times);

  if (average < 0) {
    return 'Veuillez entrer des temps valides';
  }

  const entry = await Cube.findOne({
    author: R.prop('id', author),
    date: date.format('YYYY-MM-DD'),
    event,
  }).exec();

  if (entry) {
    return 'Vous avez déjà soumis vos temps.';
  }

  await new Cube({
    author: R.prop('id', author),
    solves: R.map(secondsToTime, times),
    time: average,
    best,
    date: date.format('YYYY-MM-DD'),
    event,
  }).save();
  return `Vos temps ont bien été enregistrés ! ao5: ${secondsToTime(average)}`;
};

/**
 * Compute the daily standings and saves them to db
 * @param {String} date - Format : YYYY-MM-DD
 * @param {String} event - 333 the event for which we compete
 */
const updateStandings = R.curry(async (date, event) => {
  const monthDate = moment(date).format('YYYY-MM');
  const todayStandings = sortRankings(await Cube.find({ date, event }));
  const promisesUpdate = [];

  R.addIndex(R.forEach)((entry, index) => {
    promisesUpdate.push(
      Ranking.findOne({ date: monthDate, author: entry.author, event })
        .then(currentStanding => {
          currentStanding.score += computeScore(todayStandings.length, index);
          currentStanding.attendances++;
          return currentStanding.save();
        })
        .catch(() => {
          return new Ranking({
            date: monthDate,
            author: entry.author,
            score: computeScore(todayStandings.length, index),
            attendances: 1,
            event,
          }).save();
        })
    );
  }, todayStandings);
  await Promise.all(promisesUpdate);
});

const getDayStandings = R.curry(async (date, event) =>
  R.map(
    x =>
      R.over(
        R.lensProp('time'),
        secondsToTime
      )(R.over(R.lensProp('best'), secondsToTime)(x)),
    sortRankings(await Cube.find({ date, event }).exec())
  )
);

const getMonthStandings = R.curry(async (date, event) => {
  const monthDate = moment(date).format('YYYY-MM');
  const monthStandings = await Ranking.find({ date: monthDate, event }).exec();
  return R.sort(R.descend(R.prop('score')), monthStandings);
});

const haveTimesForToday = async (date, author, event) =>
  Boolean(await Cube.findOne({ author, date, event }).exec());

const addNotifSquad = (author, time) =>
  Squad.findOneAndUpdate(
    { event: time },
    { $addToSet: { authors: author } }
  ).exec();

const deleteNotifSquad = (author, time) =>
  Squad.findOneAndUpdate(
    { event: time },
    { $pull: { authors: author } }
  ).exec();

const getNotifSquad = R.curry(async time =>
  R.prop('authors', await Squad.findOne({ event: time }).exec())
);

module.exports = {
  insertNewTimes,
  updateStandings,
  getDayStandings,
  getMonthStandings,
  haveTimesForToday,
  addNotifSquad,
  deleteNotifSquad,
  getNotifSquad,
};
