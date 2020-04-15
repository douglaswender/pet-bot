var express = require('express')
var http = require('http');

const bot = require('./bot');

var app = express();

function keepAlive() {
    setInterval(() => {
        var options = {
            host: "http://localhost:8000/",
            post: 8000,
            path: "/"
        };
        http.get(options, function (res) {
            res.on('data', function (chunk) {
                try {
                    console.log('heroku response: ' + chunk);
                } catch (err) {
                    console.log(err.message);
                }
            }).on('error', function (err) {
                console.log('Error: ' + err.message);
            })
        })
    }, 1000);
}

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