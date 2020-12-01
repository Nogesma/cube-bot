import mongoose from 'mongoose';
import Cube from '../app/models/cubes.js';
import R from 'ramda';
import { timeToSeconds } from '../app/tools/calculators.js';
import { removeInfinity } from '../app/helpers/global-helpers.js';

mongoose.connect(process.env.MONGO_URL);

const convertSolves = (cube) => {
  console.log(cube._id);
  cube.solves = R.map(R.pipe(timeToSeconds, removeInfinity), cube.solves);
  cube.single = removeInfinity(cube.single ?? Infinity);
  cube.average = removeInfinity(cube.average ?? Infinity);
  return cube.save();
};

const update = async () => {
  const cubes = await Cube.find();
  for (const cube of cubes) {
    await convertSolves(cube);
  }
};

update().then(() => console.log('Done'));
