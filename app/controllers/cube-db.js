const mongoose = require('mongoose');
const moment = require('moment');
const R = require('ramda');
const {
  averageOfFiveCalculator,
  timeToSeconds,
  secondsToTime,
  computeScore,
  getBestTime,
  sortRankings
} = require('../tools/calculators');
const {Cube} = require('../models/cubes');
const {Squad} = require('../models/notif');
const {Ranking} = require('../models/rankings');
const {events: availableEvents} = require('../config.js');

mongoose.set('useCreateIndex', true);

mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/test',
  {useNewUrlParser: true});

const insertNewTimes = async ({channel, date, author, event, args: solves}) => {
  if (channel.type !== 'dm') {
    return 'Veuillez envoyer vos temps en message privé';
  }
  if (moment().isBetween(moment('23:55', 'HH:mm'), moment('00:05', 'HH:mm')
    .add(1, 'days'))) {
    return 'Vous ne pouvez pas soumettre vos temps entre 23h55 et 00h05';
  }
  if (solves.length !== 5) {
    return 'Veuillez entrer 5 temps';
  }
  const eventUpper = event.toUpperCase();
  if (availableEvents.indexOf(eventUpper) < 0) {
    return `Veuillez entrer un event valide : ${availableEvents}`;
  }
  const times = solves.map(timeToSeconds);
  const average = averageOfFiveCalculator(times);
  const best = getBestTime(times);

  if (average < 0) {
    return 'Veuillez entrer des temps valides';
  }

  const entry = await Cube.findOne(
    {author: author.id, date, eventUpper}).exec();
  if (entry) {
    return 'Vous avez déjà soumis vos temps.';
  }

  await new Cube({
    author: author.id,
    solves: times.map(a => secondsToTime(a)), // +2 doesn't get preserved
    time: average,
    best,
    date,
    event: eventUpper
  }).save();
  return `Vos temps ont bien été enregistrés ! ao5: ${secondsToTime(average)}`;
};

/**
 * Compute the daily standings and saves them to db
 * @param {String} date - Format : YYYY-MM-DD
 * @param {String} event - 333 the event for which we compete
 */
const updateStandings = async (date, event) => {
  const monthDate = moment(date).format('YYYY-MM');
  const todayStandings = sortRankings(await Cube.find({date, event}));
  const promisesUpdate = [];
  todayStandings.forEach((entry, index) => {
    promisesUpdate.push(
      Ranking.findOne({date: monthDate, author: entry.author, event})
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
            event
          }).save();
        })
    );
  });
  await Promise.all(promisesUpdate);
};

const getDayStandings = async (date, event) =>
  sortRankings(await Cube.find({date, event}).exec()).map(
    x => R.over(R.lensProp('time'), secondsToTime)(
      R.over(R.lensProp('best'), secondsToTime)(x)));

const getMonthStandings = async (date, event) => {
  const monthDate = moment(date).format('YYYY-MM');
  const monthStandings = await Ranking.find({date: monthDate, event}).exec();
  monthStandings.sort((a, b) => b.score - a.score);
  return monthStandings;
};

const haveTimesForToday = async (date, author, event) => Boolean(
  await Cube.findOne({author, date, event}).exec());

const addNotifSquad = (author, event) =>
  Squad.findOneAndUpdate({event}, {$addToSet: {authors: author}}).exec();

const deleteNotifSquad = (author, event) =>
  Squad.findOneAndUpdate({event}, {$pull: {authors: author}}).exec();

const getNotifSquad = async (event, date) => {
  const {authors: eventSquad} = await Squad.findOne({event}).exec();
  const todayCubers = R.pluck('author', await Cube.find({event, date}).exec());
  return R.filter(R.complement(R.includes)(R.__, todayCubers), eventSquad);
};

module.exports = {
  insertNewTimes,
  updateStandings,
  getDayStandings,
  getMonthStandings,
  haveTimesForToday,
  addNotifSquad,
  deleteNotifSquad,
  getNotifSquad
};
