'use strict';

require('dotenv').config();
const superagent = require('superagent');
const { Client } = require('pg');
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const HEARTHSTONE_API_KEY = process.env.HEARTHSTONE_API_KEY;
const bcrypt = require('bcrypt');
const saltRounds = 10;

const client = new Client(process.env.DATABASE_URL);
client.connect();
client.on('error', (error) => {
  console.log(error);
});

app.set('view engine', 'ejs');
app.use(express.urlencoded({extended: true}));
app.use(express.static('./public'));

/**Pulls in everything the const cards = in cards.js**/
const cards = require('./cards.js');


/********** ROUTES **********/

app.get('/', function(req, res) {
  res.render('pages/login', {
    message: null
  });
});

app.get('/home', function(req, res) {
  res.render('pages/home');
});

app.get('/signUp', function(req, res) {
  res.render('pages/signUp');
});

app.get('/decks', function(req, res) {
  res.render('pages/decks');
});

app.get('/builder', function(req, res) {
  res.render('pages/builder', {
    data: false
  });
});

app.post('/builder/cards', function(req, res) {
  console.log(req.body.class);
  cards.getCardByClass(req.body.class)
    .then(function (cards) {
      res.render('pages/builder', {
        data: cards
      });
    });
});

app.get('/aboutUs', function(req, res) {
  res.render('pages/aboutUs');
});

app.post('/save', function(req, res) {
  console.log(req.body);
  cards.getCardByClass(req.body.class)
    .then(function (cards) {
      res.render('pages/builder', {
        data: cards
      });
    });
});

app.get('*', function(req, res) {
  res.render('pages/error');
});

app.post('/home', function(req, res) {
  let SQL = 'SELECT * FROM users WHERE username=$1';
  let values = [req.body.uname];

  client.query(SQL, values).then(result => {
    bcrypt.compare(req.body.psw, result.rows[0].password, function(err, compareResult) {
      if(compareResult) {
        console.log(true);
        res.render('pages/home');
      } else {
        res.render('pages/login', {
          message: 'Some message'
        });
      }
    });
  });
});

/** This is how you reach the api call we probably wont need to use but in case here it is **/
app.get('/cards/classes/:className', function(req, res) {
  cards.getCardByClass(req.params.className)
    .then(result => res.send(JSON.stringify(result)));
});

/**This is the sign up madness **/
app.post('/signUp', (req, res) => {
  let SQL = 'SELECT * FROM users WHERE userName=$1';
  let values = [req.body.uname];

  client.query(SQL, values).then(result => {{
    if(!result.rows.length > 0){
      bcrypt.hash(req.body.psw, saltRounds, function(err, hash) {
        console.log(hash);
        SQL = 'INSERT INTO users (userName, password) VALUES($1, $2)';
        values = [req.body.uname, hash];
        client.query(SQL, values).then(result => {
          res.render('pages/home');
        });
      });
    } else {
      res.send('User exists');
    }
  }});
});

//Error
function handleError (error, response) {
  console.log('error', error);
  if(response) response.status(500).send('Something went wrong');
}

/* console log if server lives */
app.listen(PORT, () => console.log(`IT LIVES!!! on ${PORT}`));