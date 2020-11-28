import fs from 'fs-extra';
import R from 'ramda';
import dayjs from 'dayjs';

import { computeScore, secondsToTime } from '../tools/calculators.js';
import {
  events as availableEvents,
  hours as availableTimes,
} from '../config.js';

const helpMessage = async () =>
  R.join('\n', [
    '```Markdown',
    await fs.readFile('./app/raw-data/help.md', 'utf8'),
    '```',
  ]);

// TODO: Convert solves to string
const dailyRankingsFormat = R.curry((date, channel, ranks) =>
  R.join('\n', [
    '```glsl',
    `Classement du ${date} :`,
    ...ranks.map((cuber, idx) => {
      const user = channel.client.users.cache.get(cuber.author);
      const name = user?.username ?? 'RAGE-QUITTER';
      const pts = computeScore(ranks.length, idx);
      return R.join('\n', [
        `#${idx + 1} ${name}: ${cuber.average} ao5, ${
          cuber.single
        } single, ${pts} pts`,
        `[${R.join(', ', cuber.solves)}]`,
      ]);
    }),
    '```',
  ])
);

const _displayMonthDate = (date) =>
  dayjs().format('YYYY-MM') === date ? 'en cours' : date;

const monthlyRankingsFormat = R.curry((date, channel, ranks) =>
  R.join('\n', [
    '```xl',
    `Classement du mois (${_displayMonthDate(date)}) :`,
    ...ranks.map((cuber, idx) => {
      const user = channel.client.users.cache.get(cuber.author);
      const name = user?.username ?? 'RAGE-QUITTER';
      return `#${idx + 1} ${name} : ${cuber.score} pts (${cuber.attendances})`;
    }),
    '```',
  ])
);

const getEvent = (args, messageSender) =>
  R.pipe(
    R.head,
    R.when(R.identity)(R.toUpper),
    R.ifElse(R.flip(R.includes)(availableEvents), R.identity, () =>
      messageSender(`Veuillez entrer un event valide : ${availableEvents}`)
    )
  )(args);

const getDate = (args, messageSender) =>
  R.pipe(R.nth(1), (d) => {
    const date = dayjs(d);

    return date.isValid()
      ? date
      : messageSender(`Veuillez entrer une date valide.`);
  })(args);

const getTime = (args, messageSender) =>
  R.pipe(
    R.head,
    Number,
    R.ifElse(R.flip(R.includes)(availableTimes), R.identity, () =>
      messageSender(`Veuillez entrer une heure valide : ${availableTimes}`)
    )
  )(args);

const displayPB = R.curry((user, pb) =>
  R.join('\n', [
    `__PB de ${user.username}:__`,
    R.pipe(
      R.map(({ event, single, singleDate, average, averageDate }) =>
        R.join('\n', [
          `__${event}:__`,
          `PB Single: ${secondsToTime(single)} ${
            singleDate ? `(${dayjs(singleDate).format('YYYY-MM-DD')})` : ''
          }`,
          `PB Average: ${secondsToTime(average)} ${
            averageDate ? `(${dayjs(averageDate).format('YYYY-MM-DD')})` : ''
          }`,
        ])
      ),
      R.join('\n')
    )(pb),
  ])
);

export {
  helpMessage,
  dailyRankingsFormat,
  monthlyRankingsFormat,
  getEvent,
  getDate,
  getTime,
  _displayMonthDate,
  displayPB,
};
