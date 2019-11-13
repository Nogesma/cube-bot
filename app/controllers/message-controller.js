const moment = require('moment');
const R = require('ramda');
const {
  helpCommand,
  newTimesCommand,
  dailyRanksCommand,
  monthlyRanksCommand,
  dididoCommand,
  idoCommand,
  idonotdoCommand,
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
]);

const applyCommand = message => {
  const date = moment();
  const { author, channel } = message;
  const [command, event, ...args] = R.pipe(
    R.prop('content'),
    R.split(' ')
  )(message);

  return commandChoose({
    date,
    author,
    channel,
    command,
    event: R.when(R.identity, R.toUpper)(event),
    args,
  });
};

const incomingMessage = R.when(
  R.pipe(R.prop('content'), messageIsCommand),
  applyCommand
);

module.exports = { incomingMessage };
