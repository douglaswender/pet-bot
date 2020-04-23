const Discord = require('discord.js');
const client = new Discord.Client();

const { prefix, latestPatch } = require('./config.json');

const axios = require('axios')

const ytdl = require('ytdl-core');
const streamOptions = { volume: 0 }

const patchUrl = "https://ddragon.leagueoflegends.com/api/versions.json";

let latestUrl = latestPatch;

let data;

let queue = [];

const reader = require('./src/readPage');

require('dotenv/config');

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
        queue.shift();
        play(queue[0].snippet.resourceId.videoId, connection);
        console.log('terminei uma musica');
    });
}

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
                testChannel.send(`SE LIGA NO PATCH NOTES\nLOL: https://br.leagueoflegends.com/pt-br/news/game-updates/notas-da-atualizacao-${patch[0]}-${patch[1]}/`);
                testChannel.send(`TFT: https://br.leagueoflegends.com/pt-br/news/game-updates/notas-da-atualizacao-${patch[0]}-${patch[1]}-do-teamfight-tactics/`);
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
                                queue = response.data.items;

                                let i = 0;

                                console.log('---');
                                console.log(queue.length);

                                const id = queue[0].snippet.resourceId.videoId;
                                console.log(id);

                                play(id, conn);

                            });
                        } else {
                            let indexOfList = message.content.replace(`${prefix}play`, '').indexOf('?v=');
                            console.log(indexOfList);
                            let listId = message.content.replace(`${prefix}play`, '').substring(indexOfList + 3);
                            console.log(listId);

                            if (queue.length >= 1) {
                                console.log('existe uma música tocando ou na fila')
                                queue.push(
                                    {
                                        snippet: {
                                            resourceId: {
                                                videoId: listId
                                            }
                                        }
                                    });
                            } else {
                                console.log('primeira música adicionada com sucesso')
                                queue.push({
                                    snippet: {
                                        resourceId: {
                                            videoId: listId
                                        }
                                    }
                                });
                                play(listId, conn);
                            }
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
            } else if (message.content.startsWith(`${prefix}next`)) {
                if (queue.length === 0) {
                    message.channel.send('Não exitem músicas na fila de reprodução.')
                } else {
                    let voiceChannel = message.member.voice.channel;
                    const conn = await voiceChannel.join();
                    queue.shift();
                    play(queue[0].snippet.resourceId.videoId, conn);
                    console.log('passei uma musica');
                }

            } else if (message.content.startsWith(`${prefix}help`)) {
                const embed = new Discord.MessageEmbed().setTitle('Ajuda')
                    .setURL('https://github.com/douglaswender/pet-bot')
                    .setColor(0xff0000).setDescription('Esse é o menu de ajuda para comandos do Pet Bot')
                    .addField('$play', 'Exemplo: $play https://www.youtube.com/watch?v=2Vv-BfVoq4g')
                    .addField('$leave', 'Exemplo: $leave')
                    .setFooter('https://github.com/douglaswender/pet-bot', 'https://vignette.wikia.nocookie.net/leagueoflegends/images/6/6e/Ancient_Krug_Render.png/revision/latest?cb=20190805200952');
                message.channel.send(embed);
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