var gj;
var markers = {};
function start() {

    var ws = new WebSocket("ws://localhost:8080");
    ws.onopen = function() {
      // Web Socket is connected, send data using send()
      //ws.send("Message to send");
      console.log("ws: connection established");
    };

    ws.onmessage = function (evt) {
      console.log("ws: message received");
      var received_msg = evt.data;
      var data = JSON.parse(evt.data);
      if (!markers[data.name]) {
        // Add
        markers[data.name] = L.marker([data.lat, data.lon]).addTo(gj);        
      } else {
        // Move
        markers[data.name].setLatLng(new L.LatLng(data.lat, data.lon));
      };
    };

    ws.onclose = function() { 
      // websocket is closed.
      console.log("ws: connection closed, retry in 5 seconds...");
      // Wait a while and try again
      setTimeout(start, 5000);
    };

    window.onbeforeunload = function(event) {
      ws.close();
    };
}

function main() {
  var div = document.getElementById('map');
  var map = L.map(div).setView([52.22, 4.53], 7);
  L.tileLayer('https://api.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    id: 'mapbox.streets',
    accessToken: 'pk.eyJ1IjoibWlibG9uIiwiYSI6ImNqYTlleHZ6dTBocjgzM25pOHhoNWlndWwifQ.yQd0SHT9J3gmTqmbx1amsg'
  }).addTo(map);

  gj = L.layerGroup().addTo(map);

  if ("WebSocket" in window) {
    console.log("ws: websocket supported by browser");
    start();
  }  else {
    // The browser doesn't support WebSocket
    console.log("ws: websocket not supported by browser");
  }
}