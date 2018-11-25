const {T, cond, propEq} = require('ramda');
const {Maybe} = require('ramda-fantasy');
const moment = require('moment');
const {
  helpCommand,
  newTimesCommand,
  dailyRanksCommand,
  monthlyRanksCommand,
  dididoCommand,
  idoCommand,
  idonotdoCommand
} = require('../helpers/messages-handler');

const messageIsCommand = content => (content.indexOf('?') === 0);

const commandChoose = cond([
  [propEq('command', '?t'), newTimesCommand],
  [propEq('command', '?h'), helpCommand],
  [propEq('command', '?help'), helpCommand],
  [propEq('command', '?classement'), dailyRanksCommand],
  [propEq('command', '?classementmois'), monthlyRanksCommand],
  [propEq('command', '?didido'), dididoCommand],
  [propEq('command', '?ido'), idoCommand],
  [propEq('command', '?idonotdo'), idonotdoCommand],
  [T, () => {
  }]
]);

const applyCommand = message => {
  const date = moment().format('YYYY-MM-DD');
  const {author} = message;
  const {channel} = message;
  const [command, event, ...args] = message.content.split(' ');

  return commandChoose({date, author, channel, command, event, args});
};

const incomingMessage = message => messageIsCommand(message.content) ?
  applyCommand(message) : Maybe.Nothing;

module.exports = {incomingMessage};
