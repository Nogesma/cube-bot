import mongoose from 'mongoose';

import Bromise from 'bluebird';
import User from './app/models/user.js';
import Author from './app/models/author.js';

mongoose.Promise = Bromise;
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useFindAndModify: false,
  useCreateIndex: true,
  useUnifiedTopology: true,
});

const isOldUser = async (author) =>
  Boolean(await Author.findOne({ author }).exec());

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
    await Author.findOneAndUpdate({ author }, { $addToSet: { pb } }).exec();
  } else {
    await new Author({
      author,
      pb: [pb],
    }).save();
  }
};

const update = async () => {
  const users = await User.find();
  for (const user of users) {
    await createUsers(user);
  }

  const newAuthors = await Author.find();
  for (const author of newAuthors) {
    if (author.pb.length > 8) {
      console.log({ author: author.author });
    }
  }
};

update().then((x) => console.log(x));
// isOldUser('465948420230873089').then((x) => console.log(x));
