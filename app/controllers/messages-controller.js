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
  pipe(path(["author", "bot"]), not)
);

const commandChoose = cond([
  [propEq("command")("?t"), newTimesCommand],
  [propSatisfies(includes(__, ["?h", "?help"]))("command"), helpCommand],
  [propEq("command")("?classement"), dailyRanksCommand],
  [propEq("command")("?classementmois"), monthlyRanksCommand],
  [propEq("command")("?ido"), idoCommand],
  [propEq("command")("?idonotdo"), idonotdoCommand],
  [propEq("command")("?pb"), pbCommand],
  [propEq("command")("?scr"), scrCommand],
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
