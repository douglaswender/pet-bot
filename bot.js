const Discord = require('discord.js');
const client = new Discord.Client();

const { prefix, latestPatch } = require('./config.json');

const axios = require('axios')

const ytdl = require('ytdl-core');
const streamOptions = { volume: 0 }

const patchUrl = "https://ddragon.leagueoflegends.com/api/versions.json";

let latestUrl = latestPatch;

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


            }, 60 * 60 * 1000);

        });
    },
    message() {
        client.on("message", async (message) => { // EventEmitter
            if (message.author.bot) return;
            if (!message.content.startsWith(prefix)) return;

            if (message.content.startsWith(`${prefix}play`)) {
                const args = message.content.split(' ');
                console.log(args);
                console.log(args[1].startsWith('http'));
                let voiceChannel = message.member.voice.channel;
                if (voiceChannel) {
                    if (args[1].startsWith('http')) {
                        console.log('HTTP');
                        const conn = await voiceChannel.join();
                        if (args[1].includes('playlist')) {
                            let indexOfList = message.content.replace(`${prefix}play`, '').indexOf('list=');
                            console.log(indexOfList);
                            let listId = message.content.replace(`${prefix}play`, '').substring(indexOfList + 5);
                            console.log(listId);
                            const params = {
                                part: 'snippet',
                                key: 'AIzaSyAB2hrT-BxfpryUIcFVWbxFRd37EvJZcqM',
                                listId: listId,
                                maxResults: 50
                            };
                            console.log(params);
                            //'https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&pageToken=CDIQAA&playlistId=PL_Q15fKxrBb5d4FzxegXGGkW2eAgtukpi&key=[YOUR_API_KEY]' \

                            axios.get(`https://www.googleapis.com/youtube/v3/playlistItems?part=${params.part}&maxResults=${params.maxResults}&playlistId=${params.listId}&key=${params.key}`, {
                                headers: {
                                    'Accept': 'application/json'
                                }
                            }).then(async function (response) {
                                console.log(response.data);
                                const videoData = response.data.items;

                                let i = 0;

                                console.log('---');
                                console.log(videoData.length);

                                const id = videoData[i].snippet.resourceId.videoId;
                                console.log(id);

                                function play(videoId, connection) {
                                    const stream = ytdl(`https://www.youtube.com/watch?v=${videoId}`,
                                        {
                                            filter: 'audioonly',
                                            quality: 'highestaudio'
                                        }
                                    );

                                    const DJ = connection.play(stream, streamOptions);
                                    DJ.setVolume(0.5);
                                    DJ.on('finish', () => {
                                        videoData.shift();
                                        play(videoData[0].snippet.resourceId.videoId, connection);
                                        console.log('terminei uma musica');
                                    });
                                }

                                play(id, conn);


                            });
                        } else {
                            const stream = ytdl(args[1],
                                {
                                    filter: 'audioonly',
                                    quality: 'highestaudio'
                                });

                            const DJ = conn.play(stream, streamOptions);

                            DJ.setVolume(0.5);
                            DJ.on('finish', () => {
                                console.log('terminei aqui');
                                voiceChannel.leave();
                            });
                        }


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
                        axios.get(`https://www.googleapis.com/youtube/v3/search?part=${params.part}&maxResults=5&type=video&q=${params.term}&key=${params.key}`, {
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
                            DJ.on('finish', () => {
                                console.log('terminei aqui');
                                voiceChannel.leave();
                            });

                        });
                    }

                } else {
                    message.reply('Você precisa estar conectado em um chat de voz!');
                }
            } else if (message.content.startsWith(`${prefix}leave`)) {
                let voiceChannel = message.member.voice.channel;
                if (voiceChannel) {
                    voiceChannel.leave();
                }
            } else if (message.content.startsWith(`${prefix}help`)) {
                let voiceChannel = message.member.voice.channel;
                play.skip(message, serverQueue);
                return;
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
                message.channel.send('Precisa de um comando válido!')
            }
        });
    }
};