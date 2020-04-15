var express = require('express')
var http = require('http');
const axios = require('axios')

const bot = require('./bot');

var app = express();

function keepAlive() {
    setInterval(() => {
        axios.get("https://pet-bot-riot.herokuapp.com/").then(function(response){
            console.log(response.data);
        });
    }, 20*60*1000);
}
keepAlive();

bot.login();
bot.ready();
bot.message();

app.get('/', (req, res) => {
    return res.send({
        ok: 'ok'
    }).status(200);
});
var port = process.env.PORT || 8000;
app.listen(port);
console.log('server started ' + port);
//keepAlive();