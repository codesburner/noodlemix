var express = require('express');
var configurations = module.exports;
var app = express();
var server = require('http').createServer(app);
var nconf = require('nconf');
var settings = require('./settings')(app, configurations, express);
var redis = require('redis');
var client = redis.createClient();

nconf.argv().env().file({ file: 'local.json' });

// routes
require("./routes")(app, client);
require('./routes/auth')(app, nconf);

app.listen(process.env.PORT || nconf.get('port'));
