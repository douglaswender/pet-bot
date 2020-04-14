var express = require('express')
var path = require('path')
var serveStatic = require('serve-static')

const bot = require('./bot');

var app = express()

app.use(serveStatic(path.join(__dirname, 'dist')));

bot.login();
bot.ready();
bot.message();


var port = process.env.PORT || 8000
app.listen(port)
console.log('server started ' + port)