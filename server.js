const WebSocket = require('ws');

let CLIENTS=[];
let id;

const http = require('http');

const hostname = process.env.HOST || '127.0.0.1';
const port_webserver = process.env.PORT || 4040;

const { createLogger, format, transports } = require('winston');

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),
  defaultMeta: { service: 'server' },
  transports: [
    //
    // - Write to all logs with level `info` and below to `quick-start-combined.log`.
    // - Write all logs error (and below) to `quick-start-error.log`.
    //
    new transports.File({ filename: 'server-error.log', level: 'error' }),
    new transports.File({ filename: 'server-combined.log' })
  ]
});
function start(){
    logger.log('info', 'Start %s', 'server');
    prepareEnvironment()
    .then(function(){
        //enable services specially quividi
        //startQuividi();
        startWebServer();
        startWsServer();
        

    })
}

function prepareEnvironment(){
    
    return Promise.resolve();
}


function startWsServer(){
    logger.log('info', 'Start %s', 'ws server');
    let webSocketServer = new WebSocket.Server({ port: 5050, protocol: "viana" });
    const uuidv1 = require('uuid/v1');
    
    
    // check if connection is established
    check = true
    webSocketServer.on('connection', function(ws) {
    
        id = uuidv1();
        console.log('connection is established : ' + id);
        CLIENTS[id] = ws;
        CLIENTS.push(ws);
    
        if(check == true){
            
            check = false
        }
        ws.on('message', function(message) {
    
            idsToSend = CLIENTS.filter(c => c != id);
            sendAllExcept(message, idsToSend);
    
        });
    
        ws.on('close', function() {
            console.log('user ' + id + ' left chat');
            delete CLIENTS[id];
        });
    
    });
    
}

function sendAllExcept( message, ids ) {
    if( undefined === ids ) throw new Error( 'ids must be specified' );
    if( ! Array.isArray(ids) ) ids = [ ids ];
    for( let i = 0, cLength = CLIENTS.length; i < cLength; i++) {
        if( ids.indexOf( i ) !== -1 ) continue; /// or some othere check if shouldnt send to these client do continue
        CLIENTS[i].send( message );
    }
  }
function sendNotes(message, ws, id) {
    console.log('sendNotes : ', id);
    if (CLIENTS[id] !== ws) {
        console.log('IF : ', message);
        for (let i = 0; i < CLIENTS.length; i++) {
            CLIENTS[i].send(message);
        }
    }else{
        console.log('ELSE : ', message);
    }
}
function sendAll(message) {
    //console.log('sendAll : ');
    for (let j=0; j < CLIENTS.length; j++) {
        CLIENTS[j].send(message);
    }
}
  
function customFilter(ws){
    if(ws.hasOwnProperty('id')){

        for(let i=0; i<ws.keys(id).length; i++){
            console.log(id);
        }
    }
}


function startWebServer(){
    console.log('Start web server');
    logger.log('info', 'Start %s', 'web server');
    var express = require('express')
    var app = express()

    app.get('/', function (req, res) {
        res.send('hello world')
    })

    app.use(express.static('public'))

    app.listen(5000, function() {
        console.log('Express server listening on port ' + 5000);
    })

}

start();