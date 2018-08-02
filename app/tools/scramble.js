var Scrambo = require('scrambo');
var cron = require('cron')
var threebythree = new Scrambo();

var dailymessage = new cron.CronJob('0 0 * * *', function() {
  var dailyscramble = threebythree.get(5);
  client.channels.get(422389253951979521).send(dailyscramble);
}, null, true, 'Europe/Paris');
