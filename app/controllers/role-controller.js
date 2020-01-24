const R = require('ramda');

const addRole = (bot, ranks) => {
  const guild = R.prop('guilds', bot).get(process.env.GUILD_ID);
  const role = R.prop('roles', guild).get(process.env.ROLE_ID);
  const user = guild.member(R.prop('author', R.head(ranks)));

  if (user) user.addRole(role);
};

const removeRole = bot => {
  const role = R.prop(
    'roles',
    R.prop('guilds', bot).get(process.env.GUILD_ID)
  ).get(process.env.ROLE_ID);

  R.forEach(member => member.removeRole(role), R.prop('members', role));
};

module.exports = { addRole, removeRole };
