const express: any = require("express");
const fs: any = require("fs");

const app = express();
const time: Date = new Date();

app.use(express.json());

app.post("/status", function(request, response) {
  let thisTime: Date = new Date();
  let newTime: number = thisTime - time;
  const hours: number = parseInt(newTime / 1000 / 60 / 60);
  const minutes: number = parseInt(newTime / 1000 / 60 % 60);
  const seconds: number = parseInt(newTime / 1000 % 60);

  function twoNumber(n: number): string {
    return n >= 10 ? "" + n : "0" + n ;
  }

  response.send(twoNumber(hours) + ":" + twoNumber(minutes) + ":" + twoNumber(seconds));
});

app.post("/api/events", function(request, response) {
  if(!request.body) return response.sendStatus(400);
  const content = fs.readFileSync("new-events.json", "utf8"); // Получаю json
  const events = JSON.parse(content);

  const getType: string = request.body.type // Тип
  const getPage: number = request.body.page // Страница
  const getPageLimit: number = request.body.pageLimit || 10; // Кол-во событий на странице

  let sendEvents: object = {
    events: events["events"]
  };

  if( getType ) { // Если в запросе указаны типы событий
    const defaultEventsType = ['info', 'critical']; // Допустимые типы событий
    const filters = getType.split(":"); // Делю параметры на массив

    /* Проверка соответствия передынных типов событий с допустимыми */
    let notError: boolean = true;
    if( filters.length > 0 ) {
      filters.forEach(el => {
        if((' ' + defaultEventsType.join(' ') + ' ').indexOf(' ' + el.toLowerCase() + ' ') === -1) notError = false;
      });
    }

    if( !notError ) { // Если какой-то из параметров не совпал с допустимыми
      return response.status(400).send('incorrect type');
    } else { // Если все входящие параметры совпадают с допустимыми
      let newEvents = sendEvents["events"].filter(el => { // Фильтрую события по переданным гет параметрам
        let result: boolean = false;
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
    let start: number = getPage * getPageLimit - getPageLimit;
    let end: number = getPage * getPageLimit;
    let sendEventsLength: number = sendEvents["events"].length;
    if( start > sendEventsLength ) { // Логично при запросе на несуществующую страницу возвращать статус 404
      return response.status(404).send("<h1>Page not found</h1>");
    }
    var newEvents = [];
    for( var i = start ; i < end ; i++ ) {
      if( i >= sendEventsLength ) break;
      newEvents.push(sendEvents["events"][i]);
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
