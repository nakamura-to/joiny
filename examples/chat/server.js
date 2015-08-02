var url = require('url');
var webpack = require('webpack');
var WebpackDevServer = require('webpack-dev-server');
var config = require('./webpack.config');
var Websocket = require('websocket').server;

var webpackDevServer = new WebpackDevServer(webpack(config), {
  publicPath: config.output.publicPath,
  hot: true,
  historyApiFallback: true
});

webpackDevServer.listen(3000, 'localhost', function (err, result) {
  if (err) {
    console.log(err);
  }
  console.log('Listening at localhost:3000');
});

// websocket server
var websocketServer = new Websocket({httpServer: webpackDevServer.listeningApp});
var connections = [];
var peerId = 0;

websocketServer.on('request', function(request) {
  console.log(request.httpRequest.url);
  var pathname = url.parse(request.httpRequest.url).pathname;
  if (pathname !== '/chat') {
    return;
  }
  var connection = request.accept(null, request.origin);
  connection.id = peerId++;
  connections.push(connection);
  console.log('ws open: id=' + connection.id);

  connection.on('message', function(message) {
      if (message.type === 'utf8') {
          var signal = JSON.parse(message.utf8Data);
          console.log('_on message: type =' + signal.type);
          if (signal) {
            if (signal.type === 'subscription') {
              connection.key = signal.key;
              connection.name = signal.src.name;
              console.log('ws message:' +
                ' key=' + connection.key +
                ' id=' + connection.id + '->id=' + connection.id +
                ' type=' + signal.type);
              var peers = connections.filter(function(c) {
                return c.id !== connection.id && c.key === connection.key;
              }).map(function (c) {
                return {id: c.id, name: c.name};
              });
              connection.send(JSON.stringify({type: 'subscription', id: connection.id, peers: peers}), logError);
            } else {
              var dest = signal.dest;
              connections.forEach(function(c) {
                if (c.id === dest.id && c.key == connection.key) {
                  console.log('ws message:' +
                    ' key=' + connection.key +
                    ' id=' + connection.id + '->id=' + c.id +
                    ' type=' + signal.type);
                  c.send(message.utf8Data, logError);
                }
            });
            }
          } else {
            console.log('invalid signal: ' + message.utf8Data);
          }
      }
  });

  connection.on('close', function() {
    var pos = connections.indexOf(connection);
    if (pos !== -1) {
      connections.splice(pos, 1);
      console.log('ws close: id=' + connection.id);
    }
  });
});

function logError(error) {
  if (error !== 'Connection closed' && error !== undefined) {
    console.log('ERROR: ' + error);
  }
}
