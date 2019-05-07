const moment = require('moment');
const R = require('ramda');
const {Nothing} = require('sanctuary-maybe');
const {
  helpCommand,
  newTimesCommand,
  dailyRanksCommand,
  monthlyRanksCommand,
  dididoCommand,
  idoCommand,
  idonotdoCommand
} = require('../helpers/messages-handler');

const messageIsCommand = R.startsWith('?');

const commandChoose = R.cond([
  [R.propEq('command', '?t'), newTimesCommand],
  [R.propSatisfies(R.includes(R.__, ['?h', '?help']), 'command'), helpCommand],
  [R.propEq('command', '?classement'), dailyRanksCommand],
  [R.propEq('command', '?classementmois'), monthlyRanksCommand],
  [R.propEq('command', '?didido'), dididoCommand],
  [R.propEq('command', '?ido'), idoCommand],
  [R.propEq('command', '?idonotdo'), idonotdoCommand],
  [R.T, Nothing]
]);

const applyCommand = message => {
  const date = moment();
  const {author, channel} = message;
  const [command, event, ...args] = R.pipe(
    R.prop('content'),
    R.split(' ')
  )(message);

  return commandChoose({
    date,
    author,
    channel,
    command,
    event: event ? R.toUpper(event) : '',
    args
  });
};

const incomingMessage = message =>
  messageIsCommand(message.content) ? applyCommand(message) : Nothing;

module.exports = {incomingMessage};
