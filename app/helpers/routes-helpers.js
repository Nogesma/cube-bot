import R from 'ramda';
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
  R.pipe(fetch, R.andThen(getJSON))('https://discord.com/api/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

const getUserData = (token_type, access_token) =>
  R.pipe(fetch, R.andThen(getJSON))('https://discord.com/api/users/@me', {
    headers: {
      authorization: `${token_type} ${access_token}`,
    },
  });

const getGuildData = (token_type, access_token) =>
  R.pipe(
    fetch,
    R.andThen(getJSON),
    R.andThen(R.find(R.propEq('id')(process.env.GUILD_ID)))
  )('https://discord.com/api/users/@me/guilds', {
    headers: {
      authorization: `${token_type} ${access_token}`,
    },
  });

const setUserToken = async (author, token) =>
  Boolean(await getUserById(author))
    ? updateUser(author, token)
    : writeUser(author, token);

const getUserId = R.pipe(getUserByToken, R.andThen(R.prop('author')));

const hasValidToken = R.pipe(getUserByToken, R.andThen(Boolean));

const hasValidApiKey = async (apikey) => {
  console.log('abc');
  console.log(Boolean(await getUserByApi(apikey)));
};

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
