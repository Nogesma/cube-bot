import express from 'express';
import expressBasicAuth from 'express-basic-auth';
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
  if (!req.cookies.token) next();
  if (!(await hasValidToken(req.cookies.token))) next();
  next('route');
});

api.use(async (req, res, next) => {
  if (!(await hasValidApiKey(req.headers['x-api-key']))) res.status(401).end();
  next();
});

api.get('/scrambles/:event/?(:date)', scrambles);
api.get('/rankings/day/:event/(:date)?', dailyRankings);
api.get('/rankings/month/:event/(:date)?', monthlyRankings);

api.post('/times', times);

const oauth = authDiscord;

export { api, oauth };
