var xmlrpc = require('xmlrpc')
var server = xmlrpc.createServer({host: 'localhost', port: process.argv[2]})

let sueil = parseInt(process.argv[4])
let falling = false

var captor1 = xmlrpc.createClient({ host: 'localhost', port:4001, path: '/'})
var captor2 = xmlrpc.createClient({ host: 'localhost', port:4002, path: '/'})
var captor3 = xmlrpc.createClient({ host: 'localhost', port:4003, path: '/'})
var captor4 = xmlrpc.createClient({ host: 'localhost', port:4004, path: '/'})

var controller = xmlrpc.createClient({ host: 'localhost', port:6000, path: '/'})

server.on('NotFound', function(method, params) {
    console.log('Method ' + method + ' does not exist');
})

server.on('setFailling', function (err, params, callback) {
    console.log('Method call params for \'setFailling\': ' + process.argv[2] + "," + params)
    if(params[0])
        falling = true
    else
        falling = false
    callback(null, 'aResult')
  })
  
server.on('collect', function (err, params, callback) {
    console.log('Method call params for \'collect\': ' + params)
    let state = "défaillance_capteur"
    let c = []
    captor1.methodCall('getCaptorValue', [], function (error, value) {
        if(value != null)
            c.push(value)
    })
    
    captor2.methodCall('getCaptorValue', [], function (error, value) {
        if(value != null)
            c.push(value)
    })
    
    captor3.methodCall('getCaptorValue', [], function (error, value) {
        if(value != null)
            c.push(value)
    })
    
    captor4.methodCall('getCaptorValue', [], function (error, value) {
        if(value != null)
            c.push(value)
    })

    setTimeout(function() {
        if(c.length < 3 || falling) {
            state = "défaillance_capteur"
        } else if(!((c[0] == c[1] && c[0] == c[2] && c[0] <= sueil) 
                || (c[0] == c[1] && c[0] == c[3] && c[0] <= sueil) 
                || (c[0] == c[2] && c[0] == c[3] && c[0] <= sueil) 
                || (c[1] == c[2] && c[1] == c[3] && c[1] <= sueil))
                )
        {
            state = "alarme_température"
        } else {
            state = "température_normale"
        }

        controller.methodCall('receiveState', [process.argv[2], state], function (error, value) {})
        callback(null, state)
    }, process.argv[3]);
})
  
console.log('XML-RPC server listening on port ' + process.argv[2])
