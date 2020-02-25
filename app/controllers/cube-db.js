const moment = require('moment-timezone');
const mongoose = require('mongoose');
const R = require('ramda');
const { events: availableEvents } = require('../config');
const { Cube } = require('../models/cubes');
const { User } = require('../models/user');
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
const { dailyRankingsFormat } = require('../helpers/messages-helpers');

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

  if (
    R.includes(
      date.diff(moment('0', 'H').tz('Europe/Paris'), 'seconds'),
      R.range(-10, 1)
    )
  ) {
    return 'Vous ne pouvez pas soumettre de temps pendant la phase des résultats';
  }

  if (solves.length !== 5) {
    return 'Veuillez entrer 5 temps';
  }

  if (R.not(R.includes(event, availableEvents))) {
    return `Veuillez entrer un event valide : ${availableEvents}`;
  }

  const times = R.map(timeToSeconds, solves);
  const average = averageOfFiveCalculator(times);
  const single = getBestTime(times);
  const formattedDate = date.format('YYYY-MM-DD');

  if (average < 0) {
    return 'Veuillez entrer des temps valides';
  }

  const entry = await Cube.findOne({
    author: R.prop('id', author),
    date: formattedDate,
    event,
  }).exec();

  if (entry) {
    return 'Vous avez déjà soumis vos temps.';
  }

  await new Cube({
    author: R.prop('id', author),
    solves: R.map(secondsToTime, times),
    average,
    single,
    date: formattedDate,
    event,
  }).save();

  const chan = channel.client.channels.get(R.path(['env', event], process));

  chan
    .fetchMessages({ limit: 1 })
    .then((messages) => messages.first().delete());

  await R.pipe(
    getDayStandings(formattedDate),
    R.andThen(dailyRankingsFormat(formattedDate, chan)),
    R.andThen((x) => chan.send(x))
  )(event);

  return `Vos temps ont bien été enregistrés ! ao5: ${secondsToTime(average)}`;
};

/**
 * Compute the daily standings and saves them to db
 * @param {String} date - Format : YYYY-MM-DD
 * @param {String} event - 333 the event for which we compete
 */
const updateStandings = R.curry(async (date, event) => {
  const monthDate = moment(date)
    .tz('Europe/Paris')
    .format('YYYY-MM');
  const todayStandings = sortRankings(await Cube.find({ date, event }));
  const promisesUpdate = [];

  R.addIndex(R.forEach)(async (entry, index) => {
    promisesUpdate.push(
      User.findOne({
        author: entry.author,
        event,
      })
        .then((user) => {
          if (user.single > entry.single) {
            user.single = entry.single;
            user.singleDate = entry.date;
          }

          if (user.average > entry.average) {
            user.average = entry.average;
            user.averageDate = entry.date;
          }
        })
        .catch(() => {
          return new User({
            author: entry.author,
            single: entry.single,
            singleDate: entry.date,
            average: entry.average,
            averageDate: entry.date,
            event,
          }).save();
        })
    );

    promisesUpdate.push(
      Ranking.findOne({ date: monthDate, author: entry.author, event })
        .then((currentStanding) => {
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
    (x) =>
      R.over(
        R.lensProp('average'),
        secondsToTime
      )(R.over(R.lensProp('single'), secondsToTime)(x)),
    sortRankings(await Cube.find({ date, event }).exec())
  )
);

const getMonthStandings = R.curry(async (date, event) => {
  const monthStandings = await Ranking.find({ date, event }).exec();
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

const getNotifSquad = async (time) =>
  R.prop('authors', await Squad.findOne({ event: time }).exec());

const getTimes = async (author, event) =>
  Cube.find({ author: author.id, event }).exec();

module.exports = {
  insertNewTimes,
  updateStandings,
  getDayStandings,
  getMonthStandings,
  haveTimesForToday,
  addNotifSquad,
  deleteNotifSquad,
  getNotifSquad,
  getTimes,
};
