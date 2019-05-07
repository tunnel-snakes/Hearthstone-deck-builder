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

app.get('/', function(req, res) {
  res.render('login');
});

app.get('*', function(req, res) {
  res.render('error');
});

app.get('/home', function(req, res) {
  res.render('home');
});

app.get('/signUp', function(req, res) {
  res.render('signUp');
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

const client = new Client(process.env.DATABASE_URL);
client.connect();
client.on('error', error => console.log(error));

//Error
function handleError (error, response) {
  console.log('error', error);
  if(response) response.status(500).send('Something went wrong');
}

/* console log if server lives */ 
app.listen(PORT, () => console.log(`IT LIVES!!! on ${PORT}`));