import {
  __,
  both,
  cond,
  includes,
  not,
  path,
  pipe,
  prop,
  propEq,
  propSatisfies,
  split,
  startsWith,
  when,
} from "ramda";
import {
  dailyRanksCommand,
  helpCommand,
  idoCommand,
  idonotdoCommand,
  monthlyRanksCommand,
  newTimesCommand,
  pbCommand,
  scrCommand,
} from "../helpers/messages-handler.js";

const messageIsCommand = both(
  pipe(prop("content"), startsWith("?")),
  pipe(path(["author", "bot"]), not),
);

const commandChoose = cond([
  [propEq("?t")("command"), newTimesCommand],
  [propSatisfies(includes(__, ["?h", "?help"]))("command"), helpCommand],
  [propEq("?classement")("command"), dailyRanksCommand],
  [propEq("?classementmois")("command"), monthlyRanksCommand],
  [propEq("?ido")("command"), idoCommand],
  [propEq("?idonotdo")("command"), idonotdoCommand],
  [propEq("?pb")("command"), pbCommand],
  [propEq("?scr")("command"), scrCommand],
]);

const applyCommand = (message) => {
  const { author, channel } = message;
  const [command, ...args] = pipe(prop("content"), split(" "))(message);

  return commandChoose({
    author,
    channel,
    command,
    args,
  });
};

const incomingMessage = when(messageIsCommand)(applyCommand);

export { incomingMessage };
