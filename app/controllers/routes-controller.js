import express from 'express';

import {
  scrambles,
  authDiscord,
  times,
  dailyRankings,
  monthlyRankings,
} from '../helpers/routes-handler.js';

const api = express.Router();

api.get('/oauth/discord/:code', authDiscord);

api.get('/scrambles/:event/?(:date)', scrambles);
api.get('/rankings/day/:event/(:date)?', dailyRankings);
api.get('/rankings/month/:event/(:date)?', monthlyRankings);

api.post('/times', times);

export { api };
