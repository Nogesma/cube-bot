import R from 'ramda';

const addRole = (bot, ranks) => {
  const guild = bot.guilds.cache.get(process.env.GUILD_ID);
  const role = guild.roles.cache.get(process.env.ROLE_ID);
  const member = guild.member(R.prop('author')(R.head(ranks)));

  if (member) member.roles.add(role);
};

const removeRole = (bot) => {
  const role = bot.guilds.cache
    .get(process.env.GUILD_ID)
    .roles.cache.get(process.env.ROLE_ID);

  R.forEach((member) => member.roles.remove(role), R.prop('members')(role));
};

export { addRole, removeRole };
