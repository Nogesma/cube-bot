import R from 'ramda';
import {
  helpCommand,
  newTimesCommand,
  dailyRanksCommand,
  monthlyRanksCommand,
  dididoCommand,
  idoCommand,
  idonotdoCommand,
  pbCommand,
  scrCommand,
} from '../helpers/messages-handler.js';

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
  [R.propEq('command', '?scr'), scrCommand],
]);

const applyCommand = (message) => {
  const { author, channel } = message;
  const [command, ...args] = R.pipe(R.prop('content'), R.split(' '))(message);

  return commandChoose({
    author,
    channel,
    command,
    args,
  });
};

const incomingMessage = R.when(messageIsCommand, applyCommand);

export { incomingMessage };
