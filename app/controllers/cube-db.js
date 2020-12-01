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

const updateUserPB = (author, event, date, single, average) =>
  User.findOne({ author })
    .then((user) => {
      const eventIndex = R.findIndex(R.propEq('event', event), user.pb);
      if (eventIndex === -1) {
        user.pb = [
          ...user,
          {
            event,
            single: single,
            average: average,
            singleDate: date,
            averageDate: date,
          },
        ];
      } else {
        const eventPB = user[eventIndex] ? user[eventIndex] : {};

        if (eventPB.single > single) {
          eventPB.single = single;
          eventPB.singleDate = date;
        }

        if (eventPB.average > average) {
          eventPB.average = average;
          eventPB.averageDate = date;
        }
        user.pb = [...R.remove(eventIndex, 1, user), eventPB];
      }
      return user.save();
    })
    .catch(() => {
      return new User({
        author,
        pb: [
          {
            event,
            single: single,
            average: average,
            singleDate: date,
            averageDate: date,
          },
        ],
      }).save();
    });

const updateStandings = R.curry(async (date, event) => {
  const monthDate = dayjs(date).format('YYYY-MM');
  const todayStandings = sortRankings(await Cube.find({ date, event }));
  const promisesUpdate = [];

  R.addIndex(R.forEach)(async (entry, index) => {
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
    promisesUpdate.push(
      updateUserPB(entry.user, event, date, entry.single, entry.average)
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
      )(
        R.over(
          R.lensProp('single'),
          secondsToTime
        )(R.over(R.lensProp('solves'), R.map(secondsToTime))(x))
      ),
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

const getUserByApi = (apiKey) => User.findOne({ apiKey }).exec();

const getUserById = (author) => User.findOne({ author }).exec();

const getUserByToken = (token) => User.findOne({ token }).exec();

const writeUser = (author, token) => new User({ author, token, pb: [] }).save();

const updateUser = (author, token) =>
  User.findOneAndUpdate({ author }, { $set: { token } }).exec();

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
  getUserById,
  getUserByApi,
  getUserByToken,
  writeUser,
  updateUser,
  getScramble,
};
