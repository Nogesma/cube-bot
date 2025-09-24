import mongoose from "mongoose";
import Bromise from "bluebird";
import { map, range } from "ramda";
import Squad from "./app/models/notif.js";

mongoose.Promise = Bromise;

// mongoose.set('useCreateIndex', true);
// mongoose.set('useUnifiedTopology', true);

mongoose.connect(process.env.MONGO_URL);

const myEvents = map((event) => ({ event, authorList: [] }), range(1, 24));

const saveEvents = (events) => new Squad(events).save();

Bromise.map(myEvents, saveEvents).then(() => mongoose.disconnect());
