import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat.js';
import { nanoid } from 'nanoid';
import R from 'ramda';

import {
  getDayStandings,
  getMonthStandings,
  getScramble,
} from '../controllers/cube-db.js';
import { inserNewTimes } from './global-helpers.js';
import {
  getDiscordToken,
  getGuildData,
  getUserData,
  getUserId,
  rejectRequest,
  setUserToken,
} from './routes-helpers.js';
import { dailyRankingsFormat } from './messages-helpers.js';

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

  const { id, username, avatar } = await getUserData(token_type, access_token);

  const userInGuild = Boolean(await getGuildData(token_type, access_token));

  if (!id) return response.writeHead(400).end();
  const token = nanoid();

  setUserToken(id, token);

  response.writeHead(200, {
    'Content-Type': 'application/json',
  });
  response.cookie('token', token, { expire: dayjs().add(1, 'w').toDate() });

  response.end(JSON.stringify({ id, username, avatar, userInGuild }));
};

const scrambles = (req, res) => {
  const event = req.params.event;
  const date = dayjs(req.params.date);

  const formattedDate = (date.isValid() ? date : dayjs()).format('YYYY-MM-DD');

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
  )(formattedDate, event);
};

const times = async (request, response) => {
  const { token } = request.cookies;
  const { event, solves } = request.body;
  const { bot } = request;

  const id = await getUserId(token);

  const userInGuild = await bot.guilds.get(process.env.GUILD_ID).then((guild) =>
    guild.members
      .get(id ?? '0')
      .then((x) => console.log(x))
      .catch((err) => console.error(err))
  );

  console.log(userInGuild);

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
    inserNewTimes,
    R.andThen((result) => {
      response.end(JSON.stringify({ result }));
    })
  )(id, event, solves, bot);
};

const dailyRankings = (req, res) => {
  const { event, date } = req.params;

  res.writeHead(200, {
    'Content-Type': 'application/json',
  });
  R.pipe(
    getDayStandings,
    R.andThen(
      R.map(R.pick(['solves', 'event', 'author', 'average', 'single', 'date']))
    ),
    R.andThen(JSON.stringify),
    R.andThen((x) => res.end(x))
  )(date, event);
};

const monthlyRankings = (req, res) => {
  const { event, date } = req.params;

  res.writeHead(200, {
    'Content-Type': 'application/json',
  });
  R.pipe(
    getMonthStandings,
    R.andThen(
      R.map(R.pick(['score', 'attendaces', 'author', 'date', 'event']))
    ),
    R.andThen(JSON.stringify),
    R.andThen((x) => res.end(x))
  )(date, event);
};

export { scrambles, authDiscord, times, dailyRankings, monthlyRankings };
