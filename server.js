'use strict';

require('dotenv').config();
const superagent = require('superagent');
const { Client } = require('pg');
const express = require('express');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');

const PORT = process.env.PORT || 3000;
const saltRounds = 10;

/**Pulls in everything the const cards = in cards.js**/
const cards = require('./cards.js');

const client = new Client(process.env.DATABASE_URL);
client.connect();
client.on('error', (error) => {
  console.log(error);
});

const app = express();
app.use(cookieParser());
app.set('view engine', 'ejs');
app.use(express.urlencoded({extended: true}));
app.use(express.static('./public'));


/********** ROUTES **********/

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

app.post('/home', function(req, res) {
  let SQL = 'SELECT * FROM users WHERE username=$1';
  let values = [req.body.uname];
  console.log(req.cookies);
  client.query(SQL, values).then(result => {
    bcrypt.compare(req.body.psw, result.rows[0].password, function(err, compareResult) {
      if(compareResult) {
        let token = jwt.sign({userid : result.rows[0].userid}, process.env.PRIVATE_KEY);
        console.log(token);
        res.cookie('hearthstone_token', token);
        //res.send(true);
        res.render('pages/home');
      } else {
        res.render('pages/login', {
          message: 'Invalid Username or Password'
        });
      }
    });
  });
});

app.get('/', function(req, res) {
  res.render('pages/login', {
    message: null
  });
});

/**** All following routes will use this middleware: checks for a cookie with a token otherwise sends back to login ****/
app.use('/*', require('./cookie-auth.js')); //this also sets req.userid for all following routes (can use to set userid to deckid)

app.get('/home', function(req, res) {
  res.render('pages/home');
});

app.get('/decks', function(req, res) {
  res.render('pages/decks');
});

app.get('/builder', function(req, res) {
  res.render('pages/builder', {
    data: false
  });
});

// Deck Builder card display and save -------------------------
app.post('/builder/cards', function(req, res) {
  if(req.body.hasOwnProperty('name')) {
    cards.saveCard(req.body, 1);
    console.log('Card Saved');
  } else {
    console.log(req.body);
    cards.getCardByClass(req.body.class)
      .then(function (cards) {
        res.render('pages/builder', {
          data: cards
        });
      });
    console.log('Displaying Cards');
  }
});

app.get('/aboutUs', function(req, res) {
  res.render('pages/aboutUs');
});

app.get('*', function(req, res) {
  res.render('pages/error');
});

/** This is how you reach the api call we probably wont need to use but in case here it is **/
app.get('/cards/classes/:className', function(req, res) {
  cards.getCardByClass(req.params.className)
    .then(result => res.send(JSON.stringify(result)));
});

//Error
function handleError (error, response) {
  console.log('error', error);
  if(response) response.status(500).send('Something went wrong');
}

/* console log if server lives */
app.listen(PORT, () => console.log(`IT LIVES!!! on ${PORT}`));
