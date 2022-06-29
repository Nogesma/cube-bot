import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
  author: { type: String, required: true },
  token: { type: String, required: true },
  expires: { type: Date, require: true },
});

export default mongoose.model("Session", sessionSchema);
