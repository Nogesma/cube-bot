import mongoose from 'mongoose';
import Cube from '../app/models/cubes.js';
import Ranking from '../app/models/rankings.js';

mongoose.connect(process.env.MONGO_URL);

// Replace MINX by MEGA, PYRAM by PYRA

const update = async () => {
  await Cube.updateMany({ event: 'MINX' }, { $set: { event: 'MEGA' } });
  await Cube.updateMany({ event: 'PYRAM' }, { $set: { event: 'PYRA' } });
  await Ranking.updateMany({ event: 'MINX' }, { $set: { event: 'MEGA' } });
  await Ranking.updateMany({ event: 'PYRAM' }, { $set: { event: 'PYRA' } });
};

update().then(() => console.log('Done'));
