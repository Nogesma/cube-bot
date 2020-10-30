import mongoose from 'mongoose';
import R from 'ramda';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween.js';
import customParseFormat from 'dayjs/plugin/customParseFormat.js';

import Cube from '../models/cubes.js';
import User from '../models/user.js';
import Squad from '../models/notif.js';
import Ranking from '../models/rankings.js';
import {
  averageOfFiveCalculator,
  timeToSeconds,
  secondsToTime,
  computeScore,
  getBestTime,
  sortRankings,
} from '../tools/calculators.js';
import { dailyRankingsFormat } from '../helpers/messages-helpers.js';

mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/test', {
  useNewUrlParser: true,
  useFindAndModify: false,
  useCreateIndex: true,
  useUnifiedTopology: true,
});

dayjs.extend(isBetween).extend(customParseFormat);

const insertNewTimes = async (channel, date, author, event, solves) => {
  if (channel.type !== 'dm') {
    return 'Veuillez envoyer vos temps en message privé';
  }

  if (
    date.isBetween(dayjs('23:59', 'H:m'), dayjs('23:59', 'H:m').add(2, 'm'))
  ) {
    return 'Vous ne pouvez pas soumettre de temps pendant la phase des résultats';
  }

  if (solves.length !== 5) {
    return 'Veuillez entrer 5 temps';
  }

  const times = R.map(timeToSeconds, solves);
  const average = averageOfFiveCalculator(times);
  const single = getBestTime(times);
  const formattedDate = date.format('YYYY-MM-DD');

  if (average < 0) {
    return 'Veuillez entrer des temps valides';
  }

  const entry = await Cube.findOne({
    author: R.prop('id')(author),
    date: formattedDate,
    event,
  }).exec();

  if (entry) {
    await Cube.findOne({
      author: R.prop('id')(author),
      date: formattedDate,
      event,
    }).then((cube) => {
      cube.solves = R.map(secondsToTime, times);
      cube.average = average;
      cube.single = single;
      return cube.save();
    });
  } else {
    await new Cube({
      author: R.prop('id')(author),
      solves: R.map(secondsToTime, times),
      average,
      single,
      date: formattedDate,
      event,
    }).save();
  }

  const chan = await R.path(['client', 'channels', 'cache'], channel).get(
    R.path(['env', event], process)
  );

  chan.messages
    .fetch({ limit: 1 })
    .then((messages) => messages.first().delete());

  R.pipe(
    getDayStandings(formattedDate),
    R.andThen(dailyRankingsFormat(formattedDate)(chan)),
    R.andThen((x) => chan.send(x))
  )(event);

  return `Vos temps ont bien été ${
    entry ? 'modifiés' : 'enregistrés'
  }! ao5: ${secondsToTime(average)}`;
};

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

const getUserPB = async (author, event) =>
  User.findOne({ author: author.id, event }).exec();

export {
  insertNewTimes,
  updateStandings,
  getDayStandings,
  getMonthStandings,
  haveTimesForToday,
  addNotifSquad,
  deleteNotifSquad,
  getNotifSquad,
  getUserPB,
};
