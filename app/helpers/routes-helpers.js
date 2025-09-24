import { andThen, find, not, pipe, prop, propEq } from "ramda";
import fetch from "node-fetch";
import {
  getSessionByToken,
  getUserByApi,
  getUserById,
  newSession,
  newUser,
} from "../controllers/cube-db.js";
import dayjs from "dayjs";

const getJSON = (res) => res.json();

const rejectRequest = (req, res, message) => {
  res.writeHead(404, {
    "Content-Type": "application/json",
  });
  res.end(JSON.stringify({ message }));
};

const getDiscordToken = (body) =>
  pipe(fetch, andThen(getJSON))("https://discord.com/api/v8/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

const getUserData = (token_type, access_token) =>
  pipe(fetch, andThen(getJSON))("https://discord.com/api/v8/users/@me", {
    headers: {
      authorization: `${token_type} ${access_token}`,
    },
  });

const getGuildData = (token_type, access_token) =>
  pipe(
    fetch,
    andThen(getJSON),
    andThen(find(propEq(process.env.GUILD_ID)("id"))),
  )("https://discord.com/api/v8/users/@me/guilds", {
    headers: {
      authorization: `${token_type} ${access_token}`,
    },
  });

const setUserToken = async (author, token, expires) => {
  if (!(await getUserById(author))) await newUser(author);
  await newSession(author, token, expires);
};

const getUserId = pipe(getSessionByToken, andThen(prop("author")));

const isValid = (date) => date && dayjs().isBefore(dayjs(date));

const hasValidToken = pipe(
  getSessionByToken,
  andThen(prop("expires")),
  andThen(isValid),
);

const hasValidApiKey = async (apikey) =>
  Boolean(await getUserByApi(apikey ?? ""));

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
