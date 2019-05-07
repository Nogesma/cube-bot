const R = require('ramda');

const addRole = (bot, ranks) => {
  const guild = bot.guilds.get(process.env.GUILD_ID);
  const role = guild.roles.get(process.env.ROLE_ID);

  guild.member(ranks[0].author).addRole(role);
};

const supRole = bot => {
  const role = bot.guilds
    .get(process.env.GUILD_ID)
    .roles.get(process.env.ROLE_ID);

  R.forEach(member => member.removeRole(role), role.members);
};

module.exports = {addRole, supRole};
