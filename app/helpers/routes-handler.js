import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat.js';
import { nanoid } from 'nanoid';
import R from 'ramda';
import pkg from 'bluebird';
const { Promise } = pkg;

import {
  getDayStandings,
  getMonthStandings,
  getScramble,
} from '../controllers/cube-db.js';
import { insertNewTimes } from './global-helpers.js';
import {
  getDiscordToken,
  getGuildData,
  getUserData,
  getUserId,
  rejectRequest,
  setUserToken,
} from './routes-helpers.js';

dayjs.extend(customParseFormat);

const authDiscord = async (request, response) => {
  const code = request.params.code;
  const data = new URLSearchParams({
    client_id: process.env.CLIENT_ID,
    client_secret: process.env.CLIENT_SECRET,
    grant_type: 'authorization_code',
    code,
    scope: 'identify guilds',
    redirect_uri: process.env.WEBSITE_URL,
  });

  const { token_type, access_token } = await getDiscordToken(data);

  const { id, username, avatar, discriminator } = await getUserData(
    token_type,
    access_token
  );

  const userAvatar = avatar ?? discriminator % 5;

  const userInGuild = Boolean(await getGuildData(token_type, access_token));

  if (!id || !userInGuild) return response.writeHead(400).end();

  const token = nanoid();
  await setUserToken(id, token);

  response.cookie('token', token, {
    expire: dayjs().add(1, 'w').toDate(),
    sameSite: 'strict',
  });
  response.writeHead(200, {
    'Content-Type': 'application/json',
  });

  response.end(JSON.stringify({ id, username, avatar: userAvatar }));
};

const scrambles = (req, res) => {
  const { event, date } = req.params;

  R.pipe(
    getScramble,
    R.andThen(
      R.ifElse(
        R.identity,
        ({ scrambles }) => {
          res.writeHead(200, {
            'Content-Type': 'application/json',
          });
          res.end(JSON.stringify({ scrambles }));
        },
        () => rejectRequest(req, res, 'Scrambles not found')
      )
    )
  )(date || dayjs().format('YYYY-MM-DD'), event);
};

const times = async (request, response) => {
  const { token } = request.cookies;

  const { event, solves } = request.body;
  const { bot } = request;

  const id = await getUserId(token);

  const userInGuild = await bot.guilds
    .fetch(process.env.GUILD_ID)
    .then((guild) => guild.members.fetch(id));

  if (!userInGuild)
    return response
      .status(401)
      .send(
        'Veuillez rejoindre le serveur discord <a href="https://discord.gg/B76mDkX">Cubeurs Francophones</a> pour participer.'
      );

  response.writeHead(200, {
    'Content-Type': 'application/json',
  });

  await R.pipe(
    insertNewTimes,
    R.andThen((result) => {
      response.end(JSON.stringify({ result }));
    })
  )(
    id,
    event,
    R.map((s) => s ?? Infinity, solves),
    bot.channels
  );
};

const rankings = R.curry(async (fetchRankings, req, res) => {
  const { event, date } = req.params;
  const guild = await req.bot.guilds.cache.get(process.env.GUILD_ID);

  res.writeHead(200, {
    'Content-Type': 'application/json',
  });

  R.pipe(
    fetchRankings,
    R.andThen(
      R.map((x) => R.mergeLeft(x, getAvatarAndUsername(guild, x.author)))
    ),
    R.andThen(JSON.stringify),
    R.andThen((x) => res.end(x))
  )(date || dayjs().format('YYYY-MM-DD'), event);
});

const dailyRankings = rankings(
  R.pipe(
    getDayStandings,
    R.andThen(
      R.map(R.pick(['solves', 'event', 'author', 'average', 'single', 'date']))
    )
  )
);

const monthlyRankings = rankings(
  R.pipe(
    getMonthStandings,
    R.andThen(
      R.map(R.pick(['score', 'attendances', 'author', 'date', 'event']))
    )
  )
);

const getAvatarAndUsername = R.pipe(
  (guild, author) => guild.member(author),
  (member) => ({
    avatar: member?.user.avatar ?? member?.user.discriminator % 5,
    username: member?.user.username,
  })
);

export { scrambles, authDiscord, times, dailyRankings, monthlyRankings };
