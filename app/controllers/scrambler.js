import { curry, join, map, pipe, pluck, replace, trim } from 'ramda';
import pkg from 'scrambow';
const { Scrambow } = pkg;

const genScrambles = (event, number) =>
  pipe(
    pluck('scramble_string'),
    map(trim)
  )(new Scrambow().setType(event).get(number));

const formatScrambles = pipe(
  map(replace(/\n/g, ' ')),
  join('```\n\n```'),
  (x) => '```' + x + '```'
);

const sendScrambles = curry((date, chan, scrambles) =>
  chan.send(`**Scrambles du ${date}:**\n${scrambles}`)
);

export { genScrambles, sendScrambles, formatScrambles };
