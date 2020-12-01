import mongoose from 'mongoose';

import Bromise from 'bluebird';
import User from '../app/models/user.js';
import OldUser from '../app/models/author.js';

mongoose.Promise = Bromise;
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useFindAndModify: false,
  useCreateIndex: true,
  useUnifiedTopology: true,
});

const isOldUser = async (author) =>
  Boolean(await User.findOne({ author }).exec());

const createUsers = async ({
  event,
  single,
  singleDate,
  average,
  averageDate,
  author,
}) => {
  const isNotNew = await isOldUser(author);
  let e;
  if (event === 'MINX') {
    e = 'MEGA';
  } else if (event === 'PYRAM') {
    e = 'PYRA';
  } else {
    e = event;
  }
  const pb = { event: e, single, singleDate, average, averageDate };

  if (isNotNew) {
    await User.findOneAndUpdate({ author }, { $addToSet: { pb } }).exec();
  } else {
    await new User({
      author,
      pb: [pb],
    }).save();
  }
};

const update = async () => {
  const users = await OldUser.find();
  for (const user of users) {
    await createUsers(user);
  }

  const newUsers = await User.find();
  for (const author of newUsers) {
    if (author.pb.length > 8) {
      console.log({ author: author.author });
    }
  }
};

update().then((x) => console.log(x));
