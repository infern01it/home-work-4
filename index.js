var path = require("path");
var express = require("express");
var fs = require("fs");

var app = express();

var time = new Date();

app.get("/", function(request, response) {
    response.send("<h2>Привет Express!</h2>");
});

app.get("/status", function(request, response) {
  var thisTime = new Date();
  var newTime = thisTime - time;
  var hours = parseInt(newTime / 1000 / 60 / 60);
  var minutes = parseInt(newTime / 1000 / 60 % 60);
  var seconds = parseInt(newTime / 1000 % 60);

  function twoNumber(n) {
    return n >= 10 ? n : "0" + n ;
  }

  response.send(twoNumber(hours) + ":" + twoNumber(minutes) + ":" + twoNumber(seconds));
});

app.get("/api/events", function(request, response) {
  var events = fs.readFileSync("events.json", "utf8");

  if(request.url === "/api/events") {
    response.send(events);
  } else {
    var filter = request.url.split("?")[1].split(":");

    var string = "";
    filter.map(el => {
      string += el+" ";
    });

    // var newEvents = [];
    // events["events"].forEach(el => {
    //   if(  )
    //   return el.type === 
    // })

    response.send(events);
  }
});

app.listen(8000);