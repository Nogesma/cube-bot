import { head, map, prop } from "ramda";
import logger from "../tools/logger.js";

const addRole = async (bot, ranks) => {
  const guild = bot.guilds.cache.get(process.env.GUILD_ID);
  const role = guild.roles.cache.get(process.env.ROLE_ID);
  const author = prop("author")(head(ranks));

  if (!author) {
    logger.error("addRole: author does not exist");
    return;
  }

  const member = await guild.members.fetch(author);

  try {
    await member.roles.add(role);
  } catch (e) {
    logger.error(`addRole: could not add role to ${member}. ${e}`);
  }
};

const removeRole = async (bot) => {
  const guild = await bot.guilds.fetch(process.env.GUILD_ID);
  await guild.members.fetch();
  const role = await guild.roles.fetch(process.env.ROLE_ID);

  await Promise.all(map((member) => member.roles.remove(role), role.members));
};

export { addRole, removeRole };
