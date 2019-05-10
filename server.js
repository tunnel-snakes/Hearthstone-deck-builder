'use strict';

require('dotenv').config();
const superagent = require('superagent');
const { Client } = require('pg');
const express = require('express');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');

const PORT = process.env.PORT;
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

app.get('/decks/:id', function(req, res) {
  let SQL = `SELECT deckcards.cardid, quantity, name FROM deckcards FULL JOIN cards ON deckcards.cardid = cards.cardid WHERE deckid=$1;`;
  let values = [req.params.id];
  client.query(SQL, values).then(result1 => {
    console.log(result1.rows);
    let SQL2 = `SELECT deckname FROM decks WHERE deckid=${req.params.id};`;
    client.query(SQL2).then(result2 => {
      console.log(result2.rows);
      res.render('pages/deck-info', {
        deck: result1.rows,
        deckid: req.params.id,
        deckname: result2.rows[0]
      });
    });
  });
});

app.get('/signUp', function(req, res) {
  res.render('pages/signUp.ejs');
});

/**This is the sign up madness **/
app.post('/signUp-submit', (req, res) => {
  let SQL = 'SELECT * FROM users WHERE userName=$1';
  let values = [req.body.uname];

  client.query(SQL, values).then(result => {{
    if(!result.rows.length > 0){
      bcrypt.hash(req.body.psw, saltRounds, function(err, hash) {
        SQL = 'INSERT INTO users (userName, password) VALUES($1, $2)';
        values = [req.body.uname, hash];
        client.query(SQL, values).then(result => {
          res.redirect('/');
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
    if (result.rows.length > 0){
      bcrypt.compare(req.body.psw, result.rows[0].password, function(err, compareResult) {
        if(compareResult) {
          let token = jwt.sign({userid : result.rows[0].userid}, process.env.PRIVATE_KEY);
          console.log(token);
          res.cookie('hearthstone_token', token);
          res.render('pages/home');
        }
        else {
          res.render('pages/login', {
            message: 'Invalid Username or Password'
          });
        }
      });
    }
    else {
      res.render('pages/login', {
        message: 'You have entered an invalid username or password.'
      });
    }
  }).catch(console.error);
});

app.get('/', function(req, res) {
  res.render('pages/login', {
    message: null
  });
});

app.get('/login-submit', function(req, res) {
  res.redirect('/home');
});

/**** All following routes will use this middleware: checks for a cookie with a token otherwise sends back to login ****/
app.use('/*', require('./cookie-auth.js')); //this also sets req.userid for all following routes (can use to set userid to deckid)

app.get('/home', function(req, res) {
  res.render('pages/home');
});

app.post('/remove/:id', function(req, res) {
  if(req.body.quantity > 1) {
    let SQL = `UPDATE deckcards SET quantity=1 WHERE deckid=${req.body.deckid} AND cardid=${req.body.cardid};`;

    client.query(SQL).then(result => {
      res.redirect(`/decks/${req.body.deckid}`);
    });
  } else {
    let SQL = `DELETE FROM deckcards WHERE deckid=${req.body.deckid} AND cardid=${req.body.cardid};`;

    client.query(SQL).then(result => {
      res.redirect(`/decks/${req.body.deckid}`);
    });
  }
});

app.get('/decks', function(req, res) {
  //console.log(req.userid);
  let SQL = 'SELECT * FROM decks WHERE userid=$1;';
  let values = [req.userid];
  client.query(SQL, values).then(result => {
    console.log(result.rows);
    res.render('pages/decks', {
      decks: result.rows
    });
  });

});

app.post('/builder', function(req,res) {
  let SQL = 'INSERT INTO decks(deckname, class, userid) values($1,$2,$3);';
  let values = [req.body.deckname, req.body.class, req.userid];
  client.query(SQL, values);

  let SQL2 = 'SELECT * FROM decks WHERE deckname=$1;';
  let values2 = [req.body.deckname];

  client.query(SQL2, values2).then(result => {
    req.body.selectedClass = req.body.class;
    console.log(req.body);
    res.render('pages/builder', {
      deckid: result.rows[0].deckid,
      request: req.body,
      cards: null
    });
  });
});

// Deck Builder card display and save -------------------------
app.post('/builder/cards/:id', function(req, res) {
  if(req.body.hasOwnProperty('name')) {
    cards.saveCard(req.body, req.params.id);
    cards.getCardByClass(req.body.class)
      .then(function(cards) {
        req.body.selectedClass = req.body.class;
        console.log(req.body);
        res.render('pages/builder', {
          deckid: req.params.id,
          request: req.body,
          cards: cards
        });
      });
  } else {
    cards.getCardByClass(req.body.selectedClass)
      .then(function(cards) {
        res.render('pages/builder', {
          deckid: req.params.id,
          request: req.body,
          cards: cards
        });
      });
  }
});

app.post('/builder/add/:id', function(req, res) {
  let SQL = `SELECT class, deckname, deckid FROM decks WHERE deckid=${req.params.id};`;
  client.query(SQL).then(result => {
    result.rows[0].selectedClass = result.rows[0].class;
    console.log(result.rows);
    res.render('pages/builder', {
      deckid: req.params.id,
      request: result.rows[0],
      cards: false
    });
  });
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
