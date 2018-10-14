var path = require("path");
var express = require("express");
var fs = require("fs");

var app = express();

var time = new Date();

function $_GET(url, key) {
  url = url.match(new RegExp(key + '=([^&=]+)'));
  return url ? url[1] : false;
}

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
  var content = fs.readFileSync("events.json", "utf8"); // Получаю json
  var events = JSON.parse(content);

  if(request.url === "/api/events" || request.url === "/api/events/") { // Проверяю url (если он без гет параметра)
    response.send(events);
  } else {
    var getParams = $_GET(request.url, 'type'); // Переданные параметры
    if( !getParams ) { // Если параметров не передано
      response.status(400).send('incorrect type');
    } else { // Если параметры переданы
      var defaultEventsType = ['info', 'critical']; // Допустимые типы событий
      var filters = getParams.split(":"); // Делю параметры на массив

      var notError = true;
      if( filters.length > 0 ) {
        filters.forEach(el => {
          if((' ' + defaultEventsType.join(' ') + ' ').indexOf(' ' + el.toLowerCase() + ' ') === -1) notError = false;
        });
      }

      if( !notError ) { // Если какой-то из параметров не совпал с допустимыми
        response.status(400).send('incorrect type');
      } else { // Если все входящие параметры совпадают с допустимыми
        var newEvents = events["events"].filter(el => { // Фильтрую события по переданным гет параметрам
          var result = false;
          filters.forEach( f => {
            if( el.type === f ) {
              result = true;
            }
          });
          return result;
        });
        newEvents = {
          events: newEvents
        };
        response.send(newEvents);
      }
  
    }
  }
});

app.get("*", function(request, response) {
  response.status(404).send("<h1>Page not found</h1>");
});

app.listen(8000);