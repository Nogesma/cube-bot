const mongoose = require('mongoose');
const moment = require('moment');
const {averageOfFiveCalculator, computeScore} = require('../tools/calculators');
const {Cube} = require('../models/cubes');
const {Squad} = require('../models/notif');
const {Ranking} = require('../models/rankings');

mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/test',
  {useNewUrlParser: true});

const insertNewTimes = async (date, author, event, solves) => {
  if (solves.length !== 5) {
    return 'Veuillez entrer 5 temps';
  }

  const averageOfFive = averageOfFiveCalculator(solves);
  if (typeof averageOfFive !== 'number') {
    return 'Veuillez entrer des temps valides';
  }

  const entry = await Cube.findOne({author, date, event}).exec();
  if (entry) {
    return 'Vous avez déjà soumis vos temps.';
  }

  await new Cube({
    author,
    solves,
    time: averageOfFive,
    date,
    event
  }).save();
  return `Vos temps ont bien étés enregistrés ! ao5: ${averageOfFive}s`;
};

/**
 * Compute the daily standings and saves them to db
 * @param {String} date - Format : YYYY-MM-DD
 * @param {String} event - 333, 444 the event for which we compete
 */
const updateStandings = async (date, event) => {
  const monthDate = moment(date).format('YYYY-MM');
  const todayStandings = await Cube.find({date, event});
  const promisesUpdate = [];
  todayStandings.sort((a, b) => a.time - b.time);
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

const getDayStandings = async (date, event) => {
  return (await Cube.find({date, event}).exec())
    .sort((a, b) => a.time - b.time);
};

const getMonthStandings = async (date, event) => {
  const monthDate = moment(date).format('YYYY-MM');
  const monthStandings = await Ranking.find({date: monthDate, event}).exec();
  monthStandings.sort((a, b) => b.score - a.score);
  return monthStandings;
};

const haveTimesForToday = async (date, author, event) => Boolean(
  await Cube.findOne({author, date, event}).exec());

const addNotifSquad = (author, event) =>
  Squad.findOneAndUpdate({event}, {$addToSet: {author}}).exec();

const deleteNotifSquad = (author, event) =>
  Squad.findOneAndUpdate({event}, {$pull: {author}}).exec();

const getNotifSquad = event => {
  console.log(Squad.find({event}).exec());
  return Squad.find({event}).exec();
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
