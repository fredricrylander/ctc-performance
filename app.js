/* global __dirname */

// Require libraries.
var express = require('express');
var app = express();
var http = require('http').Server(app);

// Setup globals.
var baseDir = __dirname + '/views/';

// Define the app’s behaviour.
app.use(express.static('public'));
app.use('/performance', express.static(baseDir));

// Setup routes.
app.get('/', function (req, res) {
  res.sendFile(baseDir + '/index.html');
});

// Start the HTTP server.
var server = http.listen(3000, function () {
  console.log(
    'App listening at http://%s:%s',
    server.address().address,
    server.address().port
  );
});