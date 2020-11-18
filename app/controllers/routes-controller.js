import express from 'express';
import cors from 'cors';

import {
  scrambles,
  authDiscord,
  times,
  dailyRankings,
  monthlyRankings,
} from '../helpers/routes-handler.js';

const api = express.Router();

api.get('/oauth/discord/:code', cors(), authDiscord);

api.get('/scrambles/:event/(:date)?', cors(), scrambles);
api.get('/rankings/day/:event/(:date)?', cors(), dailyRankings);
api.get('/rankings/month/:event/(:date)?', cors(), monthlyRankings);

api.options('/times', cors({ origin: process.env.WEBSITE_URL }));
api.post('/times', cors({ origin: process.env.WEBSITE_URL }), times);

export { api };
