import { andThen, find, pipe, prop, propEq } from 'ramda';
import fetch from 'node-fetch';
import {
  getUserByApi,
  getUserById,
  getUserByToken,
  updateUser,
  writeUser,
} from '../controllers/cube-db.js';

const getJSON = (res) => res.json();

const rejectRequest = (req, res, message) => {
  res.writeHead(404, {
    'Content-Type': 'application/json',
  });
  res.end(JSON.stringify({ message }));
};

const getDiscordToken = (body) =>
  pipe(fetch, andThen(getJSON))('https://discord.com/api/v8/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

const getUserData = (token_type, access_token) =>
  pipe(fetch, andThen(getJSON))('https://discord.com/api/v8/users/@me', {
    headers: {
      authorization: `${token_type} ${access_token}`,
    },
  });

const getGuildData = (token_type, access_token) =>
  pipe(
    fetch,
    andThen(getJSON),
    andThen(find(propEq('id')(process.env.GUILD_ID)))
  )('https://discord.com/api/v8/users/@me/guilds', {
    headers: {
      authorization: `${token_type} ${access_token}`,
    },
  });

const setUserToken = async (author, token) =>
  Boolean(await getUserById(author))
    ? updateUser(author, token)
    : writeUser(author, token);

const getUserId = pipe(getUserByToken, andThen(prop('author')));

const hasValidToken = pipe(getUserByToken, andThen(Boolean));

const hasValidApiKey = async (apikey) =>
  Boolean(await getUserByApi(apikey ?? ''));

export {
  rejectRequest,
  getDiscordToken,
  getUserData,
  getGuildData,
  setUserToken,
  getUserId,
  hasValidToken,
  hasValidApiKey,
};
