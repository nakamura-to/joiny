var http = require('http');
var fs = require('fs');
var url = require('url');
var path = require('path');
var Websocket = require('websocket').server;

var port = process.env.PORT || 1234;
var connections = [];
var peerId = 0;

var CINTENT_TYPES = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css'
};

// web server
var httpServer = http.createServer(function(request, response) {
    var pathname = url.parse(request.url).pathname;
    console.log(pathname);
    if (pathname === '/') {
        pathname = 'index.html';
    } else if (pathname === '/join.js') {
        pathname = '../dist/join.js';
    }
    var filename = path.join(process.cwd(), pathname);
    console.log(filename);
    fs.exists(filename, function (exists) {
        if (exists) {
            fs.readFile(filename, function (err, data) {
                if (err) {
                    response.writeHead(500, {'Content-Type': 'text/plain'});
                    response.end(err + '\n');
                } else {
                    response.writeHead(200, {
                        'Content-Type': CINTENT_TYPES[path.extname(filename)],
                        'Cache-Control': 'no-store, no-cache'
                    });
                    response.end(data);
                }
            });
        } else {
            response.writeHead(404, {'Content-Type': 'text/plain'});
            response.end('404\n');
        }
    });

    function endsWith(str, ends){
        return str.length >= ends.length && str.slice(str.length - ends.length) === ends;
    }

});

httpServer.listen(port, function() {
    console.log('server listening (port ' + port + ')');
});

// websocket server
var websocketServer = new Websocket({httpServer: httpServer});

websocketServer.on('request', function(request) {
    var connection = request.accept(null, request.origin);
    connection.id = peerId++;
    connections.push(connection);
    console.log('ws open: id=' + connection.id);

    connection.on('message', function(message) {
        if (message.type === 'utf8') {
            var signal = JSON.parse(message.utf8Data);
            console.log('on message: type =' + signal.type);
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