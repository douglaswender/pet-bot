const Discord = require('discord.js');
const client = new Discord.Client();
const config = require('./config.json');

client.on('ready', () => {
  client.user.setPresence({
      status: 'online',
      game: {
          name: `testes`
      }
  });
});

client.login(config.token);