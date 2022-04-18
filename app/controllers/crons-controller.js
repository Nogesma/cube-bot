import { CronJob } from "cron";
import dayjs from "dayjs";
import {
  andThen,
  ap,
  includes,
  isEmpty,
  join,
  map,
  path,
  pipe,
  prop,
  unless,
} from "ramda";
import pkg from "bluebird";
import { events, hours } from "../config.js";
import {
  dailyRankingsFormat,
  monthlyRankingsFormat,
} from "../helpers/messages-helpers.js";
import logger from "../tools/logger.js";
import {
  getMonthStandings,
  getNotifSquad,
  getScramble,
  updateStandings,
} from "./cube-db.js";
import { addRole, removeRole } from "./roles-controller.js";
import { formatScrambles, sendScrambles } from "./scrambler.js";
import { prependEvent } from "../helpers/global-helpers.js";

const { Promise } = pkg;

const cronList_ = [];

const startCron = (bot) => {
  cronList_.push(
    new CronJob({
      cronTime: "30 59 23 * * *",
      onTick: () => {
        const standingsDate = dayjs().format("YYYY-MM-DD");
        Promise.each(events, updateStandings(standingsDate));
      },
      start: false,
      timeZone: "Europe/Paris",
    })
  );
  cronList_.push(
    new CronJob({
      cronTime: "30 0 0 * * *",
      onTick: async () => {
        const date = dayjs().format("YYYY-MM-DD");

        const send = sendScrambles(date);

        const scrambleSend = async (event) => {
          const chan = await bot.channels.fetch(
            path(["env", prependEvent(event)], process)
          );
          const scrambles = prop("scrambles", await getScramble(date, event));

          send(chan, formatScrambles(scrambles)).then(
            chan.send(await dailyRankingsFormat(date)(chan)([]))
          );
        };

        map(scrambleSend, events);
      },
      start: false,
      timeZone: "Europe/Paris",
    })
  );

  cronList_.push(
    new CronJob({
      cronTime: "0 0 0 1 * *",
      onTick: () => {
        removeRole(bot);
      },
      start: false,
      timeZone: "Europe/Paris",
    })
  );

  cronList_.push(
    new CronJob({
      cronTime: "30 0 0 1 * *",
      onTick: () => {
        const date = dayjs().subtract(1, "h").format("YYYY-MM");

        const [standings, rankings] = ap([
          getMonthStandings,
          monthlyRankingsFormat,
        ])([date]);

        const monthStandings = (event) => {
          const chan = bot.channels.cache.get(
            path(["env", prependEvent(event)], process)
          );

          pipe(
            standings,
            andThen(
              pipe(
                (ranks) => {
                  addRole(bot, ranks);
                  return rankings(chan, ranks);
                },
                andThen((x) => chan.send(x))
              )
            )
          )(event);
        };

        map(monthStandings, events);
      },
      start: false,
      timeZone: "Europe/Paris",
    })
  );

  cronList_.push(
    new CronJob({
      cronTime: "0 0 * * * *",
      onTick: () => {
        const time = dayjs().hour();

        if (includes(time, hours)) {
          const chan = bot.channels.cache.get(process.env.CHANNEL_SPAM);
          pipe(
            getNotifSquad,
            andThen(
              unless(isEmpty)((doc) =>
                chan.send(
                  `Participez au tournoi ! ${join(
                    " ",
                    map((x) => `<@${x}>`, doc)
                  )}`
                )
              )
            )
          )(time);
        }
      },
      start: false,
      timeZone: "Europe/Paris",
    })
  );

  cronList_.forEach((c) => c.start());
  logger.info("Cron Started");
};

const stopCron = () => {
  cronList_.forEach((c) => c.stop());
  logger.info("Cron Stopped");
};

export { startCron, stopCron };
