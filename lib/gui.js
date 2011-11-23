/*
 * Author: Zoltán Lajos Kis <zoltan.lajos.kis@ericsson.com>
 */

"use strict";

var util = require('util');
var http = require('http');
var url = require('url');
var path = require('path');

var httpStatic = require('node-static');
var socketio = require('socket.io');
var oflib = require('oflib-node');
var OFProxy = require('ofproxy-node');

module.exports = function(proxyPort, controllerHost, controllerPort, httpPort) {

    var sessions = {};
    var clients = {};

    var webroot = path.join(__dirname, '../webroot');
    var fileServer = new httpStatic.Server(webroot, {"cache" : 3600});

    var httpServer = http.createServer();

    httpServer.on('request', function (request, response) {
        request.addListener('end', function() {
            fileServer.serve(request, response);
        });

        if (url.parse(request.url).pathname == '/') {
            request.url = '/index.html';
        }
    });

    var webSocket = socketio.listen(httpServer);

    webSocket.configure(function() {
        webSocket.enable('browser client minification');
        webSocket.enable('browser client etag');
        webSocket.enable('browser client gzip');
        webSocket.set('log level', 1);
        webSocket.set('transports', ['websocket', /*'flashsocket',*/ 'htmlfile', 'xhr-polling', 'jsonp-polling']);
    });

    httpServer.listen(httpPort);

    webSocket.sockets.on('connection', function(clientSocket) {
        process.stdout.write('Client connected: ' + clientSocket.id + '.\n');

        var client = {
                    "id" : clientSocket.id,
                    "socket" : clientSocket,
                    "started" : false,
                    "types" : []
                };

        clients[clientSocket.id] = client;

        clientSocket.on('ofProxyStart', function(event) {
            client.types = event.types;

            var sessionArr = [];
            Object.keys(sessions).forEach(function(id) {
                sessionArr.push(sessions[id]);
            });

            clientSocket.emit('ofProxySessions', sessionArr);

            client.started = true;
        });

        clientSocket.on('ofProxyTypes', function(event) {
            client.types = event.types;
        });

        clientSocket.on('ofProxyStop', function() {
            client.started = false;
        });

        clientSocket.on('disconnect', function() {
            process.stdout.write('Client disconnected: ' + clientSocket.id + '.\n');

            delete clients[clientSocket.id];
        });
    });


    var proxy = new OFProxy(controllerPort, controllerHost);

    proxy.on('ofProxySessionStart', function(obj) {
        var session = {
                'id' : obj.id.toString('hex'),
                'at' : obj.at.getTime(),
                'address' : obj.address,
                'port' : obj.port
        };

        sessions[session.id] = session;
        Object.keys(clients).forEach(function(id) {
                                        var client = clients[id];
                                        if (client.started) {
                                            client.socket.emit('ofProxySessionStart', session);
                                        }
                                    });
    });

    proxy.on('ofProxySessionEnd', function(obj) {
        var end = {
                'id' : obj.id.toString('hex'),
                'at' : obj.at.getTime(),
                'by' : obj.by
        };

        delete sessions[end.id];
        Object.keys(clients).forEach(function(id) {
                                        var client = clients[id];
                                        if (client.started) {
                                            client.socket.emit('ofProxySessionEnd', end);
                                        }
                                    });
    });

    proxy.on('ofProxyMessage', function(obj) {

        var event = {
                'id' : obj.id.toString('hex'),
                'at' : obj.at.getTime(),
                'by' : obj.by,
                'message' : oflib.JSON.stringify(obj.message)
        };

        // parse features response messages for dpid
        if (obj.message.header.type == 'OFPT_FEATURES_REPLY') {


            if (obj.message.body && obj.message.body.datapath_id) {
                var session = sessions[event.id];
                session.dpid = obj.message.body.datapath_id;

                Object.keys(clients).forEach(function(id) {
                                        var client = clients[id];
                                        if (client.started) {
                                            client.socket.emit('ofProxySessionUpdate', {
                                                                        'id' : event.id,
                                                                        'dpid' : obj.message.body.datapath_id
                                                                });
                                        }
                                    });

            }
        }

        Object.keys(clients).forEach(function(id) {
                                        var client = clients[id];
                                        if (client.started && (client.types.indexOf(obj.message.header.type) != -1)) {
                                            client.socket.emit('ofProxyMessage', event);
                                        }
                                    });
    });

    proxy.on('ofProxyError', function(obj) {
        var error = {
                'id' : obj.id.toString('hex'),
                'at' : obj.at.getTime(),
                'by' : obj.by,
                'error' : obj.error
        };

        Object.keys(clients).forEach(function(id) {
                                        var client = clients[id];
                                        if (client.started) {
                                            client.socket.emit('ofProxyError', error);
                                        }
                                    });
    });

    proxy.start(proxyPort);
}