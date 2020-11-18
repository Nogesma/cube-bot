import R from 'ramda';

import Cube from '../models/cubes.js';
import User from '../models/user.js';
import Squad from '../models/notif.js';
import Ranking from '../models/rankings.js';
import Scrambles from '../models/scrambles.js';
import {
  secondsToTime,
  computeScore,
  sortRankings,
} from '../tools/calculators.js';
import dayjs from 'dayjs';

const updateCube = (author, date, event, average, single, solves) =>
  Cube.findOneAndUpdate(
    { author, date, event },
    { $set: { average, single, solves } }
  ).exec();

const writeCube = (author, date, event, average, single, solves) =>
  new Cube({ author, date, event, average, single, solves }).save();

/**
 * Compute the daily standings and saves them to db
 * @param {String} date - Format : YYYY-MM-DD
 * @param {String} event - 333 the event for which we compete
 */
const updateStandings = R.curry(async (date, event) => {
  const monthDate = dayjs(date).format('YYYY-MM');
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
            user.singleDate = date;
          }

          if (user.average > entry.average) {
            user.average = entry.average;
            user.averageDate = date;
          }
          return user.save();
        })
        .catch(() => {
          return new User({
            author: entry.author,
            single: entry.single,
            singleDate: date,
            average: entry.average,
            averageDate: date,
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
  R.prop('authors')(await Squad.findOne({ event: time }).exec());

const getUserPB = (author, event) =>
  User.findOne({ author: author.id, event }).exec();

const writeScramble = (scrambles, date, event) =>
  new Scrambles({ scrambles, date, event }).save();

const getScramble = (date, event) => Scrambles.findOne({ date, event }).exec();

export {
  updateCube,
  writeCube,
  updateStandings,
  getDayStandings,
  getMonthStandings,
  haveTimesForToday,
  addNotifSquad,
  deleteNotifSquad,
  getNotifSquad,
  getUserPB,
  writeScramble,
  getScramble,
};
