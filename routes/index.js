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
  } else {
  }
}
);


module.exports = router;
