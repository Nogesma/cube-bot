import R from 'ramda';
import pkg from 'scrambow';
const { Scrambow } = pkg;

const genScrambles = (event, number) =>
  R.pipe(
    R.pluck('scramble_string'),
    R.map(R.trim)
  )(new Scrambow().setType(event).get(number));

const formatScrambles = R.pipe(
  R.map(R.replace(/\n/g, ' ')),
  R.join('```\n```'),
  (x) => R.join('', ['```', x, '```'])
);

const sendScrambles = R.curry((date, chan, scrambles) =>
  chan.send(R.join('\n', [`**Scrambles du ${date}:**`, scrambles]))
);

export { genScrambles, sendScrambles, formatScrambles };
