var express = require('express');
var router = express.Router();
var sqlite3 = require('sqlite3').verbose()
var randomstring = require('randomstring');

const DBSOURCE = "db.sqlite"

let db = new sqlite3.Database(DBSOURCE, (err) => {
    if (err) {
      // Cannot open database
      console.error(err.message)
      throw err
    }else{
        console.log('Connected to the SQLite database.')
        db.run('SELECT * FROM PEOPLE', [], (res, err) => {console.log(res);});
    }
  }
);


router.post('/', function(req, res, next){
  var randomstr = randomstring.generate(24);
  var name = req.body.name;
  var dates = req.body.dates;
  console.log(req.body);
  db.serialize(function() {
    db.run('INSERT INTO PEOPLE(key, name, dates) VALUES(?, ?, ?)', [randomstr, name, JSON.stringify(dates)], (res, err) => {console.log(res);});
  });
  res.json({key: randomstr});
});

/* GET home page. */
router.get('/:key', function(req, res, next) {
  console.log(req.body);
  res.json({ title: 'Express', body: req.body, key: req.params.key });
});

module.exports = router;
