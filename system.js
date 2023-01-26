'use strict';

const express = require('express');
const path = require('path');
const { createServer } = require('http');
const { WebSocketServer } = require('ws');
const { fork } = require('child_process');
var xmlrpc = require('xmlrpc');
const { generateKey } = require('crypto');

const app = express();
app.use(express.static(path.join(__dirname, '/public')));

const server = createServer(app);
const wss = new WebSocketServer({ server });

let deltaTime = 5000

let nbCaptor = 4
let portCaptor = 4001

let nbCollector = 3
let portCollector = 5001

let seuil = 800

let color = "grey"
let pipeDown = true

for (let i = 1; i <= nbCaptor; i++) {
    fork("captor.js", [portCaptor])
    portCaptor++
}

fork("controller.js", [6000])

for (let i = 1; i <= nbCollector; i++) {
    fork("collector.js", [portCollector, deltaTime/5 + 50, seuil])
    portCollector++
}

wss.on('connection', function (ws) {
    ws.on('message', function(dataJSON) {
        let data = JSON.parse(dataJSON)
        switch(data.message) {
            case "changeTemp":
                var captor = xmlrpc.createClient({ host: 'localhost', port: data.captor, path: '/'})
                captor.methodCall('setTemp', [data.value], function (error, value) {  })
                break
            case "setFaillingCollector":
                var collector = xmlrpc.createClient({ host: 'localhost', port: data.collector, path: '/'})
                collector.methodCall('setFailling', [data.value], function (error, value) {  })
                break
            case "setDisableCaptor":
                var captor = xmlrpc.createClient({ host: 'localhost', port: data.captor, path: '/'})
                captor.methodCall('setDisable', [data.value], function (error, value) {  })
                break

        }
    })
});

var controller = xmlrpc.createClient({ host: 'localhost', port:6000, path: '/'})
var collector1 = xmlrpc.createClient({ host: 'localhost', port:5001, path: '/'})
var collector2 = xmlrpc.createClient({ host: 'localhost', port:5002, path: '/'})
var collector3 = xmlrpc.createClient({ host: 'localhost', port:5003, path: '/'})

server.listen(8080, function () {
    console.log('Listening on http://localhost:8080');
});

setInterval(function() {
    collector1.methodCall('collect', [], function (error, value) {  })
    collector2.methodCall('collect', [], function (error, value) {  })
    collector3.methodCall('collect', [], function (error, value) {  })
    setTimeout(function() {
        controller.methodCall('controll', [], function (error, value) {
            pipeDown = value[0]
            color = value[1]
            wss.clients.forEach(ele => {
                ele.send(JSON.stringify({color: color, pipe: pipeDown}))
            })
        })
    }, deltaTime/5 + 100)
}, deltaTime)