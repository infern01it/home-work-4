var express = require("express");
var fs = require("fs");

var app = express();
var time = new Date();

app.use(express.json());

app.post("/status", function(request, response) {
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

app.post("/api/events", function(request, response) {
  if(!request.body) return response.sendStatus(400);
  var content = fs.readFileSync("new-events.json", "utf8"); // Получаю json
  var events = JSON.parse(content);

  var getType = request.body.type // Тип
  var getPage = request.body.page // Страница
  var getPageLimit = request.body.pageLimit || 10; // Кол-во событий на странице

  var sendEvents = {
    events: events["events"]
  };

  if( getType ) { // Если в запросе указаны типы событий
    var defaultEventsType = ['info', 'critical']; // Допустимые типы событий
    var filters = getType.split(":"); // Делю параметры на массив

    /* Проверка соответствия передынных типов событий с допустимыми */
    var notError = true;
    if( filters.length > 0 ) {
      filters.forEach(el => {
        if((' ' + defaultEventsType.join(' ') + ' ').indexOf(' ' + el.toLowerCase() + ' ') === -1) notError = false;
      });
    }

    if( !notError ) { // Если какой-то из параметров не совпал с допустимыми
      return response.status(400).send('incorrect type');
    } else { // Если все входящие параметры совпадают с допустимыми
      var newEvents = sendEvents["events"].filter(el => { // Фильтрую события по переданным гет параметрам
        var result = false;
        filters.forEach( f => {
          if( el.type === f ) {
            result = true;
          }
        });
        return result;
      });
      sendEvents = {
        events: newEvents
      };
    }
  }
  if( getPage ) {
    var start = getPage * getPageLimit - getPageLimit;
    var end = getPage * getPageLimit;
    if( end - 1 > sendEvents["events"].length ) { // Логично при запросе на несуществующую страницу возвращать статус 404
      return response.status(404).send("<h1>Page not found</h1>");
    }
    var newEvents = [];
    for( var i = start ; i < end ; i++ ) {
      newEvents.push(sendEvents["events"][i])
    }
    sendEvents = {
      events: newEvents
    };
  }

  response.send(sendEvents);
});

app.post("*", function(request, response) {
  response.status(404).send("<h1>Page not found</h1>");
});

app.listen(8000);