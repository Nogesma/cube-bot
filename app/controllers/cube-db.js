const mongoose = require('mongoose');
const moment = require('moment');
const {averageOfFiveCalculator, computeScore} = require('../tools/calculators');
const {Cube} = require('../models/cubes');
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
          currentStanding.wins += (index === 0) ? 1 : 0;
          currentStanding.podiums += (index <= 2) ? 1 : 0;
          return currentStanding.save();
        })
        .catch(() => {
          return new Ranking({
            date: monthDate,
            author: entry.author,
            score: computeScore(todayStandings.length, index),
            wins: (index === 0) ? 1 : 0,
            podiums: (index <= 2) ? 1 : 0,
            event
          }).save();
        })
    );
  });
  await Promise.all(promisesUpdate);
};

const getTodayStandings = async (date, event) => {
  const todayStandings = await Cube.find({date, event}).exec();
  todayStandings.sort((a, b) => a.time - b.time);
  return todayStandings;
};

const getMonthStandings = async (date, event) => {
  const monthDate = moment(date).format('YYYY-MM');
  const monthStandings = await Ranking.find({date: monthDate, event}).exec();
  monthStandings.sort((a, b) => b.score - a.score);
  return monthStandings;
};

const haveTimesForToday = async (date, author, event) => Boolean(
  await Cube.findOne({author, date, event}).exec());

module.exports = {
  insertNewTimes,
  updateStandings,
  getTodayStandings,
  getMonthStandings,
  haveTimesForToday
};
