const Discord = require('discord.js');
const mysql = require('mysql');

const divideByThree = 1 / 3;
const con = mysql.createConnection({
  host: "localhost",
  user: "alexi",
  password: "psw",
  database: "cubes"
});

let everEnded = false;

const getLastRecord = sql => {
  return new Promise((resolve, reject) => {
    con.query(sql, (err, rows) => {
      (err) ? reject(err) : resolve(rows);
    });
  });
};

const insertNewTimes = (channel, date, author, content) => {
  const sql = "SELECT * FROM `compete` WHERE `date` = '" + date +
    "' AND `player` LIKE \"" + author + "\";";

  return getLastRecord(sql)
    .then(rows => {
      if (rows.length !== 0) {
        channel.send(
          "Vous avez déjà entré vos temps. Si vous avez commis une erreur veuillez contacter Alexi");
      } else if (content.indexOf(',') >= 0) {
        channel.send("Veuillez utiliser des points au lieu de virgules.");
      } else {
        let timeEntries = content.split(' ');
        timeEntries.shift();

        if (timeEntries.length !== 5) {
          channel.send("Veuillez entrer vos 5 temps.");
        } else {
          timeEntries = timeEntries.map(a => Number(a));
          const extremum = Math.min(...timeEntries) + Math.max(...timeEntries);
          const total = timeEntries.reduce((a, b) => a + b);

          const ao5 = Math.floor((total - extremum) * divideByThree * 100) *
            0.01;

          const sql = "INSERT INTO `compete` (`id`, `date`, `temps`, `attempt`, `player`) VALUES (NULL, '" +
            date + "', '" + ao5 + "', '0', '" + author + "' );";
          con.query(sql, () => {
          });

          channel.send(
            `${author} vos temps ont bien étés enregistrés ! Votre ao5 est de: ${ao5}s`);
        }
      }
    })
    .catch(err => console.log(err));
};

const getRanks = channel => {
  const sql = "SELECT * FROM `score` ORDER BY `points` DESC";
  return getLastRecord(sql).then(rows => {
    let bufferSend = "Bravo à tous les participants ! Voilà le classement du mois en cours !";
    rows.map((a, idx) => {
      bufferSend +=
        '\n' + `${idx + 1}. ${a.player} points: ${a.points} ao5: ${a.ao5}s`;
      if (a.win !== 0) {
        bufferSend += ` victoire(s): ${a.win}`;
      }

      if (a.podium !== 0) {
        bufferSend += ` podium(s): ${a.podium}`;
      }

      bufferSend += ' !';
    });

    channel.send(bufferSend);
  }).catch(err => console.log(err));
};

con.connect(err => {
  if (err) throw err;
  console.log("Connected!");
});

// Create an instance of a Discord client
const client = new Discord.Client();

// The token of your bot - https://discordapp.com/developers/applications/me
const token = 'token';

// The ready event is vital, it means that your bot will only start reacting to information
// from Discord _after_ ready is emitted
client.on('ready', () => {
  console.log('I am ready!');
});

// Create an event listener for messages
client.on('message', message => {
  const content = message.content;
  const author = message.author;
  const channel = message.channel;

  const now = new Date();
  const date = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;

  const [command] = content.split(' ');

  switch (command) {
    case '?t':
      insertNewTimes(channel, date, author, content);
      break;
    case '?classement':
      getRanks(channel);
      break;
    default:
      channel.send('Non reconnu');
      break;
  }
});

setInterval(() => { // TODO mettre le message pour setup
  const date = new Date();
  if (!everEnded && (date.getHours() === 23) && (date.getMinutes() === 50)) {
    everEnded = true;
    endcomp(message);
    setTimeout(() => {
      everEnded = false;
      ncomp(message);
    }, 10 * 60 * 1000);
  }
}, 55 * 1000);

//   if (message.content.startsWith('?classement')) {
//
//     ; // Throw async to escape the promise chain
//   }
// })
// ;

// Log our bot in
client.login(token);


const endcomp = message => {
  const ladate = new Date();
  const dte = ladate.getFullYear() + "-" + (ladate.getMonth() + 1) + "-" +
    ladate.getDate();
  const sql = "SELECT * FROM `compete` WHERE `date` = '" + dte +
    "' ORDER BY `temps`";
  getLastRecord(sql).then(function (rows) {
    let rst = "Bravo à tous les participants ! Voilà le classement d'aujourd'hui ! \nEnvoyer moi \"?classement\" par message privé pour connaitre le classement de ce mois !";
    for (let i = 0; i < rows.length; i++) {
      rst = endcompsuite(rows, message, rst, i);

    }
    message.channel.send(rst);
  }).catch(err => console.log(err));
};// Throw async to escape the promise chain

const endcompsuite = (rows, message, rst, i) => {
  let r = i + 1;
  console.log(rows.length + "-" + r + ")" + rows.length + "v -" + 1);
  let p = 50 + 50 * ((rows.length - r) / (rows.length - 1));
  let row = rows[i];
  rst += "\n " + r + ". " + row.player + " ao5: " + row.temps + "s !";
  let pts = 0;
  let win = 0;
  let podium = 0;
  let sqlt = "SELECT * FROM `score` WHERE `player` = \"" + row.player + "\";";
  let ao = row.temps;
  let tps = row.ao5;
  let rows = "";

  return getLastRecord(sqlt)
    .then(rowz => {
      let rowe = rowz[0];
      win = 0;
      podium = 0;
      if (r === 1) {
        win = win + 1;
      }
      if (i < 3) {
        podium = podium + 1;
      }
      let sqt = "";
      if (rowe === undefined) {
        sqt =
          "INSERT INTO `score` (`id`, `player`, `ao5`, `points`, `win`, `podium`) VALUES (NULL, '" +
          row.player + "', '" + row.temps + "', '" + p + "', '" + win + "', '" +
          podium + "')";
      }
      else {
        pts = p + rowe.points;
        win = win + rowe.win;
        podium = podium + rowe.podium;
        if (rowe.ao5 < row.temps) {
          row.temps = rowe.ao5;
        }
        sqt =
          "UPDATE `score` SET `ao5` = '" + row.temps + "', `points` = '" + pts +
          "', `win` = '" + win + "', `podium` = '" + podium +
          "' WHERE `score`.`id` = " + rowe.id + ";";
      }
      console.log(sqt);
      getLastRecord(sqt)
        .then(rowsz => {
        })
        .catch(err => console.log(err));
      // Throw async to escape the promise chain
    })
    .catch(err => console.log(err));
  // Throw async to escape the promise chain
  console.log(i); // TODO unreachable
  return (rst);
};

function ncomp(message) {
  const ladate = new Date();
  const dte = ladate.getDate() + "-" + (ladate.getMonth() + 1) + "-" +
    ladate.getFullYear();
  let dsd = Date.now();
  dsd = Math.floor((dsd * 0.001) - 1514761200);
  dsd = Math.floor((dsd / 3600) / 24);
  const txt = "Compétition du " + dte +
    " \n Vous pouvez soumettre vos temps en m'envoyant en message privée: \"?t w.xy w.xy w.xy w.xy w.xy\" où chaque \"w.xy\" correspond à votre temps sur chaque mélange. Voilà les mélanges d'aujourd'hui ! En cas d'erreur n'hesitez pas à mentionner <@290031598076821504> !";
  if (dsd < 100) {
    message.channel.send(txt, {
      file: "http://54.37.64.4/alexi/ilovepdf_pages_to_jpg-2/Scrambles-for-2018-03-10-0" +
      dsd + ".jpg"
    });
  }
  else {
    message.channel.send(txt, {
      file: "http://54.37.64.4/alexi/ilovepdf_pages_to_jpg-2/Scrambles-for-2018-03-10-" +
      dsd + ".jpg"
    });
  }
}
