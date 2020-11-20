import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat.js';
import fetch from 'node-fetch';
import R from 'ramda';

import {
  getDayStandings,
  getMonthStandings,
  getScramble,
} from '../controllers/cube-db.js';
import { inserNewTimes } from './global-helpers.js';
import { dailyRankingsFormat } from './messages-helpers.js';

dayjs.extend(customParseFormat);

const rejectRequest = (req, res, message) => {
  res.writeHead(404, {
    'Content-Type': 'application/json',
  });
  res.end(JSON.stringify({ message }));
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

const authDiscord = async (request, response) => {
  const getJSON = (res) => res.json();

  const code = request.params.code;
  const data = new URLSearchParams({
    client_id: process.env.CLIENT_ID,
    client_secret: process.env.CLIENT_SECRET,
    grant_type: 'authorization_code',
    code,
    scope: 'identify guilds',
    redirect_uri: process.env.WEBSITE_URL,
  });

  const { token_type, access_token } = await R.pipe(fetch, R.andThen(getJSON))(
    'https://discord.com/api/oauth2/token',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: data,
    }
  );

  const headers = {
    authorization: `${token_type} ${access_token}`,
  };

  const { id, username, avatar } = await R.pipe(
    fetch,
    R.andThen(getJSON)
  )('https://discord.com/api/users/@me', { headers });

  const isInGuild = await R.pipe(
    fetch,
    R.andThen(getJSON),
    R.andThen(R.find(R.propEq('id')(process.env.GUILD_ID)))
  )('https://discord.com/api/users/@me/guilds', { headers });

  response.writeHead(200, {
    'Content-Type': 'application/json',
  });
  response.end(JSON.stringify({ id, username, avatar, isInGuild }));
};

const times = (req, res) => {
  const { author, event, solves } = req.body;

  res.writeHead(200, {
    'Content-Type': 'application/json',
  });

  R.pipe(
    inserNewTimes,
    R.andThen(async (result) => {
      res.end(JSON.stringify({ result }));
      if (R.test(/^Vos/, result)) {
        const chan = await req.bot.channels.fetch(
          R.path(['env', event], process)
        );
        const date = dayjs().format('YYYY-MM-DD');

        chan.messages
          .fetch({ limit: 1 })
          .then((messages) => messages.first().delete());
        R.pipe(
          getDayStandings,
          R.andThen(dailyRankingsFormat(date)(chan)),
          R.andThen((x) => chan.send(x))
        )(date, event);
      }
    })
  )(author, event, solves);
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
