import mongoose from "mongoose";
import { Client, GatewayIntentBits, Partials } from "discord.js";
import express from "express";
import cookieParser from "cookie-parser";

import { incomingMessage } from "./app/controllers/messages-controller.js";
import logger from "./app/tools/logger.js";
import { startCron, stopCron } from "./app/controllers/crons-controller.js";
import { api, oauth } from "./app/controllers/routes-controller.js";

const bot = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages,
  ],
  partials: [Partials.Channel],
});

const app = express();
const port = 3000;

mongoose.connect(process.env.MONGO_URL || "mongodb://localhost:27017/test");

bot.on("ready", () => {
  logger.info("Bot ready");
  startCron(bot);
  bot.user.setActivity({ name: "for new PB | ?h", type: 3 });
});

bot.on("messageCreate", incomingMessage);
bot.login(process.env.TOKEN);

app.use(express.json());
app.use((req, res, next) => {
  req.bot = bot;
  next();
});
app.use(cookieParser());

app.post("/api/oauth/discord/:code", oauth);
app.use("/api", api);

app.listen(port, () => {
  logger.info(`Server listenning on port ${port}`);
});

process.on("exit", () => {
  stopCron();
  mongoose.disconnect();
  logger.info("Exiting");
});
