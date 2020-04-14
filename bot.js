const Discord = require('discord.js');
const client = new Discord.Client();

const patchUrl = "https://ddragon.leagueoflegends.com/api/versions.json";

let latestUrl = '';

let data;

const reader = require('./src/readPage');

require('dotenv/config');

module.exports = {
    login() {
        client.login(process.env.TOKEN);
    },
    ready() {
        client.on('ready', async () => {
            //668808435579486220
            var testChannel;

            client.channels.fetch('668808435579486220').then(channel => {
                testChannel = channel;
            });

            // Set the client user's activity
            client.user.setActivity('$help', { type: 'LISTENING' })
                .then(presence => console.log(`Activity set to ${presence.activities[0].name}`))
                .catch(console.error);

            data = await reader.getUrl(patchUrl);

            if (latestUrl !== data[0]) {
                console.log('atualizando patch notes');
                latestUrl = data[0];
                const patch = data[0].split('.');
                console.log(patch);
                testChannel.send(`https://br.leagueoflegends.com/pt-br/news/game-updates/notas-da-atualizacao-${patch[0]}-${patch[1]}/`);

            }


            setInterval(async () => {

                data = await reader.getUrl(patchUrl);

                console.log(data);

                if (latestUrl !== data[0]) {
                    console.log('atualizando patch notes');
                    latestUrl = data[0];
                    const patch = data[0].split('.');
                    console.log(patch);
                    testChannel.send(`https://br.leagueoflegends.com/pt-br/news/game-updates/notas-da-atualizacao-${patch[0]}-${patch[1]}/`);

                }


            }, 3600000);

        });
    },
    message() {
        client.on("message", (message) => { // EventEmitter
            if (message.content == "!ping") { // Check if message is "!ping"
                message.channel.send("Pinging ...") // Placeholder for pinging ... 
                    .then((msg) => { // Resolve promise
                        msg.edit("Ping: " + (Date.now() - msg.createdTimestamp)) // Edits message with current timestamp minus timestamp of message
                    });
            }
        });

    }
}






