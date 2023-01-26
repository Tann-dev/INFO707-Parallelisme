var xmlrpc = require('xmlrpc')

var server = xmlrpc.createServer({host: 'localhost', port: process.argv[2]})

let temp = 100
let lastTemp = 100

server.on('NotFound', function(method, params) {
  console.log('Method ' + method + ' does not exist');
})

server.on('getCaptorValue', function (err, params, callback) {
    console.log('Method call params for \'getCaptorValue\': ' + process.argv[2] + "," + temp)
    callback(null, temp)
})

server.on('setTemp', function (err, params, callback) {
    console.log('Method call params for \'setTemp\': ' + process.argv[2] + "," + params)
    temp = params[0]
    lastTemp = temp
    callback(null, temp)
})

server.on('setDisable', function (err, params, callback) {
    console.log('Method call params for \'setDisable\': ' + process.argv[2] + "," + params)
    if(params[0])
        temp = null
    else 
        temp = lastTemp
    callback(null, temp)
})

console.log('XML-RPC server listening on port ' + process.argv[2])