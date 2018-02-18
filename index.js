'use strict';

const https = require('https');
const fs = require('fs');
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: process.env.PORT || 8080 });
const parser = require('xml2js').parseString;
const moment = require('moment');
const utils = require('./helpers/utils');
const path = require('path');

var xmloptions = {
  explicitArray: false,
  trim: true,
  mergeAttrs: true,
  parseNumbers: true 
};

function constructResponse(data){
  console.log(data.index);
  //Reached the end? Reset.
  if(!data[data.index] || !data[data.index + 1]){
    data.index = 0;
  }

  var out = utils.toPoint(data[data.index]);
  // get the time difference
  var timediff = moment(data[data.index + 1].time).diff(moment(data[data.index].time));
  out.time = moment().toJSON();
  out.timer = timediff;
  // get the distance
  var distance = utils.getDistance(utils.toPoint(data[data.index]), utils.toPoint(data[data.index + 1])); //meter
  out.distance = distance;

  // calculate the speed
  var speed = distance/(timediff / 1000); // meter per second
  out.speed = Math.ceil(speed * 3.6); //km/h rounded up

  // calculate the direction
  out.direction = utils.getBearing(data[data.index], data[data.index + 1]);

  // Add name
  out.name = data.name;
  
  // Set real time out.
  setTimeout(sendPoint, timediff, data);
  out.index = data.index;
  data.index++;
  return out;
}

function sendPoint(data) {
  var response = constructResponse(data);
  console.log(response);
 
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(response));
    }
  });
}

wss.on('connection', function connection(ws) {
  ws.on('message', function incoming(message) {
    console.log('received: %s', message);
  });
});

fs.readdir("./resources/", function(err, files){
  
  files.forEach(function(file){
    if(path.extname(file) === ".gpx"){
    //if(file === "23352.gpx"){
      var name = file.split('.')[0];
      
      fs.readFile("./resources/" + file, "utf8", function(err, data){
        if (err) {
          throw err;
        }

        parser(data, xmloptions, function (err, result){
          result.gpx.trk.trkseg.trkpt.name = name;
          result.gpx.trk.trkseg.trkpt.index = 0;
          sendPoint(result.gpx.trk.trkseg.trkpt);
        });
      })
    }
  })
});