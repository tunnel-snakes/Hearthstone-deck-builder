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

app.set('view engine', 'ejs');
app.use(express.urlencoded({extended: true}));
app.use(express.static('./public'));

const client = new Client(process.env.DATABASE_URL);
client.connect();
client.on('error', error => console.log(error));

/**Pulls in everything the const cards = in cards.js**/
const cards = require('./cards.js');

/********** ROUTES **********/

app.get('/', function(req, res) {
  res.render('pages/login');
});

app.get('/home', function(req, res) {
  res.render('home');
});

app.get('/signUp', function(req, res) {
  res.render('pages/signUp');
});

app.get('/decks', function(req, res) {
  res.render('decks');
});

app.get('/builder', function(req, res) {
  res.render('builder');
});

app.get('/aboutUs', function(req, res) {
  res.render('aboutUs');
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