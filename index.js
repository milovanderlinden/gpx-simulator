'use strict';

const https = require('https');
const fs = require('fs');
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: process.env.PORT || 8080 });
const parser = require('xml2js').parseString;

var point = 0;

var xmloptions = {
  explicitArray: false,
  trim: true,
  mergeAttrs: true,
  parseNumbers: true 
};

function sendPoint(data) {
  var ts = Math.floor(Date.now() / 1000);
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      if(data[point]){
        client.send(JSON.stringify(data[point]));
      } else {
        point = 0;
        client.send(JSON.stringify(data[point]));
      }
      
    }
  });
  point++;
}
function setTimeStamp(){
  var ts = Math.floor(Date.now() / 1000);
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(ts);
    }
  });
}

wss.on('connection', function connection(ws) {
  ws.on('message', function incoming(message) {
    console.log('received: %s', message);
  });
});


fs.readFile("./resources/209687.gpx", "utf8", function(err, data){
  if (err) {
    throw err;
  }
  
  parser(data, xmloptions, function (err, result){
    setInterval(sendPoint, 1500, result.gpx.trk.trkseg.trkpt);
  });
});