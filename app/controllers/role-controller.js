const supRole = bot => {
  const role = bot.guilds
    .get(process.env.GUILD_ID)
    .roles.get(process.env.ROLE_ID);

  role.members.map(member => member.removeRole(role));
};

const addRole = (bot, ranks) => {
  const guild = bot.guilds.get(process.env.GUILD_ID);
  const role = guild.roles.get(process.env.ROLE_ID);

  guild.member(ranks[0].author).addRole(role);
};

module.exports = {supRole, addRole};
