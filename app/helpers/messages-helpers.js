import fs from "fs-extra";
import {
  addIndex,
  curry,
  flip,
  head,
  identity,
  ifElse,
  includes,
  join,
  map,
  nth,
  pipe,
  replace,
  toUpper,
  when,
} from "ramda";
import dayjs from "dayjs";

import { computeScore, secondsToTime } from "../tools/calculators.js";
import {
  events as availableEvents,
  hours as availableTimes,
} from "../config.js";

const helpMessage = async () =>
  join("\n", [
    "```Markdown",
    await fs.readFile("./app/raw-data/help.md", "utf8"),
    "```",
  ]);

const dailyRankingsFormat = curry(async (date, channel, ranks) =>
  join("\n", [
    "```glsl",
    `Classement du ${date} :`,
    (
      await Promise.all(
        addIndex(map)(async (cuber, idx) => {
          const name = await parseUsername(cuber.author, channel);
          const pts = computeScore(ranks.length, idx);
          return join("\n", [
            `#${idx + 1} ${name}: ${cuber.average} ao5, ${
              cuber.single
            } single, ${pts} pts`,
            `[${join(", ", cuber.solves)}]`,
          ]);
        }, ranks)
      )
    ).join("\n"),
    "```",
  ])
);

const _displayMonthDate = (date) =>
  dayjs().format("YYYY-MM") === date ? "en cours" : date;

const monthlyRankingsFormat = curry(async (date, channel, ranks) =>
  join("\n", [
    "```xl",
    `Classement du mois (${_displayMonthDate(date)}) :`,
    (
      await Promise.all(
        addIndex(map)(
          async (cuber, idx) =>
            `#${idx + 1} ${await parseUsername(cuber.author, channel)} : ${
              cuber.score
            } pts (${cuber.attendances})`,
          ranks
        )
      )
    ).join("\n"),
    "```",
  ])
);

const parseUsername = async (author, channel) => {
  const user = await channel.client.users.fetch(author);
  const name = user?.username ?? "RAGE-QUITTER";
  return replace(/'/g, "ˈ", name);
};

const getEvent = (args, messageSender) =>
  pipe(
    head,
    when(identity)(toUpper),
    ifElse(flip(includes)(availableEvents), identity, () =>
      messageSender(`Veuillez entrer un event valide : ${availableEvents}`)
    )
  )(args);

const getDate = (args, messageSender) =>
  pipe(nth(1), (d) => {
    const date = dayjs(d);

    return date.isValid()
      ? date
      : messageSender(`Veuillez entrer une date valide.`);
  })(args);

const getTime = (args, messageSender) =>
  pipe(
    head,
    Number,
    ifElse(flip(includes)(availableTimes), identity, () =>
      messageSender(`Veuillez entrer une heure valide : ${availableTimes}`)
    )
  )(args);

const displayPB = curry((user, pb) =>
  join("\n", [
    `__PB de ${user.username}:__`,
    pipe(
      map(({ event, single, singleDate, average, averageDate }) =>
        join("\n", [
          `__${event}:__`,
          `PB Single: ${secondsToTime(single)} ${
            singleDate ? `(${dayjs(singleDate).format("YYYY-MM-DD")})` : ""
          }`,
          `PB Average: ${secondsToTime(average)} ${
            averageDate ? `(${dayjs(averageDate).format("YYYY-MM-DD")})` : ""
          }`,
        ])
      ),
      join("\n")
    )(pb),
  ])
);

export {
  helpMessage,
  dailyRankingsFormat,
  monthlyRankingsFormat,
  getEvent,
  getDate,
  getTime,
  _displayMonthDate,
  displayPB,
};
