const R = require('ramda');
const {Scrambow} = require('scrambow');

const event333 = async () => R.pipe(
  R.pluck('scramble_string'),
  R.map(R.trim),
  R.join('``````')
)(new Scrambow().get(5));

const event222 = async () => R.pipe(
  R.pluck('scramble_string'),
  R.map(R.trim),
  R.join('``````')
)(new Scrambow().setType('222').get(5));

const event444 = async () => R.pipe(
  R.pluck('scramble_string'),
  R.map(R.trim),
  R.join('``````')
)(new Scrambow().setType('444').get(5));

const eventMega = async () => R.pipe(
  R.pluck('scramble_string'),
  R.map(R.trim),
  R.join('``````')
)(new Scrambow().setType('minx').get(5));

const sendScrambles = (chan, event, date, scrambles) =>
  chan.send(`**Scrambles de ${event} du ${date}:**\n\`\`\`` +
    scrambles + '```');

module.exports = {event333, event222, event444, eventMega, sendScrambles};
