var xmlrpc = require('xmlrpc')

var server = xmlrpc.createServer({host: 'localhost', port: process.argv[2]})

let col1 , col2, col3
let dataCol = []

// Handle methods not found
server.on('NotFound', function(method, params) {
  console.log('Method ' + method + ' does not exist');
})

server.on('receiveState', function (err, params, callback) {
    console.log('Method call params for \'receiveState\': ' + params)
    dataCol.push(params)
    callback(null, 'aResult')
})

server.on('controll', function (err, params, callback) {
  console.log('Method call params for \'controll\'')
    dataCol.forEach(ele => {
      if(ele[0] == 5001)
        col1 = ele[1]
      else if(ele[0] == 5002)
        col2 = ele[1]
      else if(ele[0] == 5003)
        col3 = ele[1]
    })
    // toDo : action à faire, la première case du tableau est un bool, qui dit s'il faut baisser les barres ou pas.
    // La deuxième case du tableau est la couleur du bouton à afficher.
    toDo = []
    if(col1 == "alarme_température" || col2 == "alarme_température" || col3 == "alarme_température") { 
      toDo = [true, "rouge"] 
    } else if((col1 == "défaillance_capteur" && col2 == "défaillance_capteur") 
      || (col1 == "défaillance_capteur" && col3 == "défaillance_capteur") 
      || (col3 == "défaillance_capteur" && col2 == "défaillance_capteur")
      ) {
      toDo = [true, "orange"]
    } else if(col1 == "défaillance_capteur" || col2 == "défaillance_capteur" || col3 == "défaillance_capteur") {
      toDo = [false, "orange"]
    } else {
      toDo = [false, "vert"]
    }
    dataCol = []
    col1, col2, col3 = undefined
    callback(null, toDo)
})

console.log('XML-RPC server listening on port ' + process.argv[2])