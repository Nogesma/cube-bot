const R = require('ramda');
const {Scrambow} = require('scrambow');

const event333 = async () => R.join('\n',
  R.pluck('scramble_string', new Scrambow().get(5)));

const event222 = async () => R.join('\n',
  R.pluck('scramble_string', new Scrambow().setType('222').get(5)));

const sendScrambles = (chan, event, date, scrambles) =>
  chan.send(`Scrambles ${event} (${date})\n` + scrambles);

module.exports = {event333, event222, sendScrambles};
