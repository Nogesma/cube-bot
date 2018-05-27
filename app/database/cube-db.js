const Sequelize = require('sequelize');
const {averageOfFiveCalculator} = require('../tools/calculators');

const sequelize = new Sequelize({
  database: process.env.database,
  username: process.env.username,
  password: process.env.password,
  dialect: 'sqlite',
  operatorsAliases: false
});

const cubeDB = sequelize.define('cubes', {
  date: {type: Sequelize.DATEONLY, defaultValue: Sequelize.NOW},
  time: {type: Sequelize.FLOAT, allowNull: false},
  author: {type: Sequelize.STRING, allowNull: false}
});

const standings = sequelize.define('rankings', {
  date: {type: Sequelize.DATEONLY, defaultValue: Sequelize.NOW},
  author: {type: Sequelize.STRING, allowNull: false},
  score: {type: Sequelize.FLOAT, defaultValue: 0},
  wins: {type: Sequelize.INTEGER, defaultValue: 0},
  podiums: {type: Sequelize.INTEGER, defaultValue: 0}
});

const insertNewTimes = async (date, author, content) => {
  if (content.length !== 5) {
    return 'Veuillez entrer 5 temps';
  }

  const averageOfFive = averageOfFiveCalculator(content);
  if (typeof averageOfFive !== 'number') {
    return 'Veuillez entrer des temps valides';
  }

  const entry = await cubeDB.findOne({where: {author, date}});
  if (entry) {
    return 'Vous avez déjà soumis vos temps.';
  }

  await cubeDB.create({author, time: averageOfFive});
  return `Vos temps ont bien étés enregistrés ! AO5: ${averageOfFive}s`;
};

const updateStandings = async (date, monthDate) => {
  // SAVED FOR LATER const monthDate = moment().format('YYYY-MM');
  const todayStandings = await cubeDB.findAll({where: {date}});
  const promisesUpdate = [];
  todayStandings.sort((a, b) => a.time - b.time);
  todayStandings.forEach((entry, index) => {
    promisesUpdate.push(
      standings.findOrCreate({where: {date: monthDate, author: entry.author}})
        .then(currentStanding => {
          currentStanding.score += computeScore(todayStandings.length, index);
          currentStanding.wins += (index === 0) ? 1 : 0;
          currentStanding.podiums += (index <= 2) ? 1 : 0;
          return currentStanding.save();
        })
    );
  });
  await Promise.all(promisesUpdate);
};

const getMonthStandings = async monthDate => {
  const monthStandings = await cubeDB.findAll({where: {date: monthDate}});
  monthStandings.sort((a, b) => a.score - b.score);
  return monthStandings;
};

module.exports = {insertNewTimes, updateStandings, getMonthStandings};
