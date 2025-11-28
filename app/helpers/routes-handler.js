import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat.js";
import { nanoid } from "nanoid";
import {
  andThen,
  curry,
  identity,
  ifElse,
  map,
  mergeLeft,
  pick,
  pipe,
} from "ramda";

import {
  getDayStandings,
  getMonthStandings,
  getScramble,
  getSessionByToken,
  getSvg,
} from "../controllers/cube-db.js";
import { insertNewTimes } from "./global-helpers.js";
import {
  getDiscordToken,
  getGuildData,
  getUserData,
  getUserId,
  rejectRequest,
  setUserToken,
} from "./routes-helpers.js";
import { timeToSeconds } from "../tools/calculators.js";

dayjs.extend(customParseFormat);

const authDiscord = async (request, response) => {
  const code = request.params.code;
  const data = new URLSearchParams({
    client_id: process.env.CLIENT_ID,
    client_secret: process.env.CLIENT_SECRET,
    grant_type: "authorization_code",
    code,
    scope: "identify guilds",
    redirect_uri: process.env.WEBSITE_URL,
  });

  const { token_type, access_token } = await getDiscordToken(data);

  const { id, username, avatar, discriminator } = await getUserData(
    token_type,
    access_token,
  );

  const userAvatar = avatar ?? discriminator % 5;

  const userInGuild = Boolean(await getGuildData(token_type, access_token));

  if (!id || !userInGuild) return response.writeHead(400).end();

  const token = nanoid();
  const expires = dayjs().add(1, "M").toDate();

  await setUserToken(id, token, expires);

  response.cookie("token", token, {
    expires,
    sameSite: "strict",
  });
  response.writeHead(200, {
    "Content-Type": "application/json",
  });

  response.end(JSON.stringify({ id, username, avatar: userAvatar }));
};

const scrambleString = async (req, res) => {
  const { event, date } = req.params;

  pipe(
    getScramble,
    andThen(
      ifElse(
        identity,
        ({ scrambles }) => {
          res.writeHead(200, {
            "Content-Type": "application/json",
          });
          res.end(JSON.stringify({ scrambles }));
        },
        () => rejectRequest(req, res, "Scrambles not found"),
      ),
    ),
  )(date || dayjs().format("YYYY-MM-DD"), event);
};

const scrambleSvg = async (req, res) => {
  const { event, date } = req.params;

  pipe(
    getSvg,
    andThen(
      ifElse(
        identity,
        ({ svg }) => {
          res.writeHead(200, {
            "Content-Type": "application/json",
          });
          res.end(JSON.stringify({ svg }));
        },
        () => rejectRequest(req, res, "Svg not found"),
      ),
    ),
  )(date || dayjs().format("YYYY-MM-DD"), event);
};

const times = async (request, response) => {
  const { token } = request.cookies;

  const { event, solves } = request.body;
  const { bot } = request;

  const { author } = await getSessionByToken(token);

  const userInGuild = await bot.guilds
    .fetch(process.env.GUILD_ID)
    .then((guild) => guild.members.fetch())
    .then((guildMembers) => guildMembers.has(author));

  if (!userInGuild)
    return response
      .status(401)
      .send(
        'Veuillez rejoindre le serveur discord <a href="https://discord.gg/B76mDkX">Cubeurs Francophones</a> pour participer.',
      );

  if (!solves.every((x) => typeof x === "string"))
    return response.status(400).send("Invalid solves");

  response.writeHead(200, {
    "Content-Type": "application/json",
  });

  await pipe(
    insertNewTimes,
    andThen((result) => {
      response.end(JSON.stringify({ result }));
    }),
  )(author, event, solves, bot.channels);
};

const rankings = curry(async (fetchRankings, req, res) => {
  const { event, date } = req.params;
  const guild = await req.bot.guilds.cache.get(process.env.GUILD_ID);

  res.writeHead(200, {
    "Content-Type": "application/json",
  });

  pipe(
    fetchRankings,
    andThen(
      map(async (x) =>
        mergeLeft(x, await getAvatarAndUsername(guild, x.author)),
      ),
    ),
    andThen((x) => Promise.all(x)),
    andThen(JSON.stringify),
    andThen((x) => res.end(x)),
  )(date || dayjs().format("YYYY-MM-DD"), event);
});

const dailyRankings = rankings(
  pipe(
    getDayStandings,
    andThen(
      map(pick(["solves", "event", "author", "average", "single", "date"])),
    ),
  ),
);

const monthlyRankings = rankings(
  pipe(
    getMonthStandings,
    andThen(map(pick(["score", "attendances", "author", "date", "event"]))),
  ),
);

const getAvatarAndUsername = pipe(
  (guild, author) => guild.members.fetch(author),
  andThen((member) => ({
    avatar: member?.user.avatar ?? member?.user.discriminator % 5,
    username: member?.user.username,
  })),
);

export {
  scrambleString,
  scrambleSvg,
  authDiscord,
  times,
  dailyRankings,
  monthlyRankings,
};
