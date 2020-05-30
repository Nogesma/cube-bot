const moment = require('moment-timezone');
const R = require('ramda');
const {
  helpCommand,
  newTimesCommand,
  dailyRanksCommand,
  monthlyRanksCommand,
  dididoCommand,
  idoCommand,
  idonotdoCommand,
  pbCommand,
} = require('../helpers/messages-handler');

const messageIsCommand = R.both(
  R.pipe(R.prop('content'), R.startsWith('?')),
  R.pipe(R.path(['author', 'bot']), R.not)
);

const commandChoose = R.cond([
  [R.propEq('command', '?t'), newTimesCommand],
  [R.propSatisfies(R.includes(R.__, ['?h', '?help']), 'command'), helpCommand],
  [R.propEq('command', '?classement'), dailyRanksCommand],
  [R.propEq('command', '?classementmois'), monthlyRanksCommand],
  [R.propEq('command', '?didido'), dididoCommand],
  [R.propEq('command', '?ido'), idoCommand],
  [R.propEq('command', '?idonotdo'), idonotdoCommand],
  [R.propEq('command', '?pb'), pbCommand],
]);

const applyCommand = (message) => {
  const date = moment().tz('Europe/Paris');
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

const incomingMessage = R.when(messageIsCommand, applyCommand);

module.exports = { incomingMessage };
