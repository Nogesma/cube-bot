import express from 'express';
import {
  scrambles,
  authDiscord,
  times,
  dailyRankings,
  monthlyRankings,
} from '../helpers/routes-handler.js';
import { hasValidToken, hasValidApiKey } from '../helpers/routes-helpers.js';

const api = express.Router();

api.use(async (req, res, next) => {
  if (
    !(
      (req.cookies.token && (await hasValidToken(req.cookies.token))) ||
      (await hasValidApiKey(req.headers['x-api-key']))
    )
  )
    return res.status(401).end();
  next();
});

api.get('/scrambles/:event/(:date)?', scrambles);
api.get('/ping', (req, res) => res.sendStatus(200));
api.get('/rankings/day/:event/(:date)?', dailyRankings);
api.get('/rankings/month/:event/(:date)?', monthlyRankings);

api.post('/times', times);

const oauth = authDiscord;

export { api, oauth };
