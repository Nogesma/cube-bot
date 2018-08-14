const mongoose = require('mongoose');
const {averageOfFiveCalculator, computeScore} = require('../tools/calculators');
const {Cube} = require('../models/cubes');
const {Ranking} = require('../models/rankings');

mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/test',
  {useNewUrlParser: true});

const insertNewTimes = async (date, author, content) => {
  if (content.length !== 5) {
    return 'Veuillez entrer 5 temps';
  }

  const averageOfFive = averageOfFiveCalculator(content);
  if (typeof averageOfFive !== 'number') {
    return 'Veuillez entrer des temps valides';
  }

  const entry = await Cube.findOne({author, date}).exec();
  if (entry) {
    return 'Vous avez déjà soumis vos temps.';
  }
  await new Cube({author, solves: content, time: averageOfFive, date}).save();
  return `Vos temps ont bien étés enregistrés ! ao5: ${averageOfFive}s`;
};

/**
 * Compute the daily standings and saves them to db
 * @param {String} date - Format : YYYY-MM-DD
 */
const updateStandings = async date => {
  const monthDate = date.slice(0, -3);
  const todayStandings = await Cube.find({date});
  const promisesUpdate = [];
  todayStandings.sort((a, b) => a.time - b.time);
  todayStandings.forEach((entry, index) => {
    promisesUpdate.push(
      Ranking.findOne({date: monthDate, author: entry.author})
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
            podiums: (index <= 2) ? 1 : 0
          }).save();
        })
    );
  });
  await Promise.all(promisesUpdate);
};

const getTodayStandings = async date => {
  const todayStandings = await Cube.find({date}).exec();
  todayStandings.sort((a, b) => a.time - b.time);
  return todayStandings;
};

const getMonthStandings = async date => {
  const monthDate = date.slice(0, -3);
  const monthStandings = await Ranking.find({date: monthDate}).exec();
  monthStandings.sort((a, b) => b.score - a.score);
  return monthStandings;
};

const haveTimesForToday = async (date, author) => {
  return Boolean(await Cube.findOne({author, date}).exec());
};

module.exports = {
  insertNewTimes,
  updateStandings,
  getTodayStandings,
  getMonthStandings,
  haveTimesForToday
};
