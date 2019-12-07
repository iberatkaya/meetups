var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors')
const bodyParser = require('body-parser');
var sqlite3 = require('sqlite3').verbose()
var randomstring = require('randomstring');

const DBSOURCE = "./db.sqlite"

let db = new sqlite3.Database(DBSOURCE, (err) => {
  if (err) {
    // Cannot open database
    console.error(err.message)
    throw err
  } else {
    console.log('Connected to the SQLite database.')
    db.serialize(function () {
      db.run('CREATE TABLE IF NOT EXISTS PEOPLE (id INTEGER PRIMARY KEY AUTOINCREMENT, key NUMBER, name NUMBER, dates INTEGER, roomtitle TEXT)', [], (res, err) => { console.log(res); });
    })
  }
}
);

var app = express();
app.use(cors());
app.options('*', cors());  // enable pre-flightapp.use(logger('dev'));

// view engine setup
/*app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');*/

app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());


  // Serve any static files
  //app.use(express.static(path.join(__dirname, 'client/build')));
  app.use(express.static(path.join(__dirname, 'client/build')));
  app.post('/api', function (req, res, next) {
    var randomstr = randomstring.generate({
      length: 32,
      charset: 'alphanumeric'
    });
    var name = req.body.name;
    var dates = req.body.dates
    var roomtitle = req.body.roomtitle;
    //console.log(req.body);
    db.serialize(function () {
      db.run('INSERT INTO PEOPLE(key, name, dates, roomtitle) VALUES(?, ?, ?, ?)', [randomstr, name, JSON.stringify(dates), roomtitle], (res, err) => { console.log(res); });
    });
    res.json({ key: randomstr });
  });

  /* GET home page. */
  app.get('/api/:key', function (req, res, next) {
  //  console.log(req.params.key);
    db.serialize(function () {
      db.all('SELECT * FROM PEOPLE WHERE key = ?', [req.params.key], (err, rows) => {
      //  console.log(rows);
        res.json(rows);
      });
    });
  });

  app.post('/api/:key', function (req, res, next) {
    //console.log(req.params.key);
    db.serialize(function () {
      db.run('INSERT INTO PEOPLE(key, name, dates, roomtitle) VALUES(?, ?, ?, ?)', [req.params.key, req.body.name, JSON.stringify(req.body.dates), req.body.roomtitle], (result, err) => { console.log(result); 
        res.json({success: "1"});     
      });
    });
  });

  // Handle React routing, return all requests to React app
  app.get('*', function(req, res) {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
  


module.exports = app;
