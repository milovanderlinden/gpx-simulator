/** 
 * Converts numeric degrees to radians 
 */
if(typeof(Number.prototype.toRad) === "undefined") {
  Number.prototype.toRad = function () {
      return this * Math.PI / 180;
  }
}

exports.toPoint = function(data) {
  return {
    lat: parseFloat(data.lat),
    lon: parseFloat(data.lon),
  }
}

exports.getBearing = function(start, end) {
  var radLat1 = parseFloat(end.lat) * Math.PI / 180;
  var radLat2 = parseFloat(start.lat) * Math.PI / 180;
  var radLng1 = parseFloat(end.lon) * Math.PI / 180;
  var radLng2 = parseFloat(start.lon) * Math.PI / 180;

  var y = Math.sin(radLng2- radLng1) * Math.cos(radLng2);
  var x = Math.cos(radLat1)*Math.sin(radLat2) - Math.sin(radLat1)*Math.cos(radLat2)*Math.cos(radLng2-radLng1);
  var bearing = parseFloat((Math.atan2(y, x)).toFixed(2));
  return bearing;
}

/**
 * start and end are objects with latitude and longitude
 * decimals (default 2) is number of decimals in the output
 * return is distance in meters. 
 */
exports.getDistance = function(start, end, decimals) {
  var earthRadius = 6371; // km
  lat1 = parseFloat(start.lat);
  lat2 = parseFloat(end.lat);
  lon1 = parseFloat(start.lon);
  lon2 = parseFloat(end.lon);

  var dLat = (lat2 - lat1).toRad();
  var dLon = (lon2 - lon1).toRad();
  var lat1 = lat1.toRad();
  var lat2 = lat2.toRad();

  var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = (earthRadius * c) * 1000; // In meters
  if(decimals){
    return Math.round(d * Math.pow(10, decimals)) / Math.pow(10, decimals);
  }
  return d;
  
};