const Discord = require('discord.js');
const client = new Discord.Client();

const { prefix } = require('./config.json');

const axios = require('axios')

const ytdl = require('ytdl-core');
const streamOptions = { volume: 0 }

const patchUrl = "https://ddragon.leagueoflegends.com/api/versions.json";

let latestUrl = '';

let data;

const reader = require('./src/readPage');
const play = require('./commands/play');

require('dotenv/config');

module.exports = {
    login() {
        client.login(process.env.TOKEN);
    },
    ready() {
        client.on('ready', async () => {
            //668808435579486220
            //699419762098176033 - test
            var testChannel;

            client.channels.fetch('699419762098176033').then(channel => {
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
        client.on("message", async (message) => { // EventEmitter
            if (message.author.bot) return;
            if (!message.content.startsWith(prefix)) return;
            //const serverQueue = queue.get(message.guild.id);

            if (message.content.startsWith(`${prefix}play`)) {
                const args = message.content.split(' ');
                console.log(args);
                console.log(args[1].startsWith('http'));
                let voiceChannel = message.member.voice.channel;


                console.log(voiceChannel);
                if (voiceChannel) {
                    if (args[1].startsWith('http')) {
                        const conn = await voiceChannel.join();
                        const stream = ytdl(args[1],
                            { filter: 'audioonly' });

                        const DJ = conn.play(stream, streamOptions);

                    } else {
                        const params = {
                            part: 'id',
                            key: 'AIzaSyAB2hrT-BxfpryUIcFVWbxFRd37EvJZcqM',
                            term: message.content.toLowerCase().replace('$play', '').replace(' ', '%20').replace('é', '%C3%A9').replace('á', '%C3%A1'),
                            type: 'video'
                        };
                        console.log(params.term);
                        //api key AIzaSyAB2hrT-BxfpryUIcFVWbxFRd37EvJZcqM
                        //https://www.googleapis.com/youtube/v3/search?part=id&maxResults=5&type=video&q=céu azul&key=AIzaSyAB2hrT-BxfpryUIcFVWbxFRd37EvJZcqM
                        //https://www.googleapis.com/youtube/v3/search?part=${params.part}&maxResults=5&type=video&q=${params.term}&key=${params.key}
                        axios.get(`https://www.googleapis.com/youtube/v3/search?part=id&maxResults=5&type=video&q=C%C3%A9u%20azul&key=AIzaSyAB2hrT-BxfpryUIcFVWbxFRd37EvJZcqM`, {
                            headers: {
                                'Accept': 'application/json'
                            }
                        }).then(async function (response) {
                            console.log(response.data);
                            const videoData = response.data.items[0];
                            console.log('---');
                            console.log(videoData.id.videoId);
                            const conn = await voiceChannel.join();

                            const stream = ytdl(`https://www.youtube.com/watch?v=${videoData.id.videoId}`,
                                {
                                    filter: 'audioonly',
                                    quality: 'highestaudio'
                                }
                            );

                            const DJ = conn.play(stream, streamOptions);
                            DJ.setVolume(0.5);
                            DJ.on('finish', ()=>{
                                console.log('terminei aqui');
                                voiceChannel.leave();
                            });

                        });
                    }

                } else {
                    message.reply('Você precisa estar conectado em um chat de voz!');
                }
                if (voiceChannel === null) {
                    console.log('Canal não encontrado.');
                } else {


                    // c.join().then(connection => {
                    //     const stream = ytdl(args[1], 
                    //     {filter: 'audioonly'});
                    //     const DJ = connection.playStream(stream, streamOptions);

                    //     DJ.on('end', end=> {
                    //         voiceChannel.leave();
                    //     })
                    // })
                    // .catch(console.error);
                }
            } else if (message.content.startsWith(`${prefix}skip`)) {
                play.skip(message, serverQueue);
                return;
            } else if (message.content.startsWith(`${prefix}stop`)) {
                play.stop(message, serverQueue);
                return;
            } else if (message.content.startsWith(`${prefix}ping`)) {
                message.channel.send("Pinging ...") // Placeholder for pinging ... 
                    .then((msg) => { // Resolve promise
                        msg.edit("Ping: " + (Date.now() - msg.createdTimestamp)) // Edits message with current timestamp minus timestamp of message
                    });
                return;
            } else {
                message.channel.send('You need to enter a valid command!')
            }
        });
    }
};











