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
  res.status(404).send('404 not found');
});

// const client = new Client(process.env.DATABASE_URL);
// client.connect();
// client.on('error', error => console.log(error));

// // create danny devito card
// let SQL1 = `INSERT INTO cards (name, type, class, cost, img) VALUES($1, $2, $3, $4, $5)`;
// let values1 = ['Danny Devito', 'Minion', 'Warrior', 10, 'https://www.magnumdong.gov'];
// client.query(SQL1, values1);

// create user
let SQL2 = 'INSERT INTO users (userName, password) VALUES($1, $2)';
let values2 = ['Ian Smith', 'password'];
client.query(SQL2, values2);

// // create deck for user 1
// let SQL3 = `INSERT INTO decks (deckName, class, userId) VALUES($1, $2, $3)`;
// let values3 = ['Deck 1', 'Warrior', 1];
// client.query(SQL3, values3);

// // put card into deckCards
// let SQL4 = `INSERT INTO decksCards (decksId, cardsId) VALUES($1, $2)`;
// let values4 = [1, 1];
// client.query(SQL4, values4);

function getCards(query) {
  let url = `https://omgvamp-hearthstone-v1.p.rapidapi.com/${query}`;
  superagent.get(url)
    .set("X-RapidAPI-Host", "omgvamp-hearthstone-v1.p.rapidapi.com")
    .set("X-RapidAPI-Key", HEARTHSTONE_API_KEY)
    .then(data => {
      data.body.Basic.forEach(card => {
        if(card.type === 'Minion' || card.type === 'Spell' || card.type === 'Weapon') {
          console.log(new MakeCard(card));
        }
      });
    });
}
getCards('cards');

//Error
function handleError (error, response) {
  console.log('error', error);
  if(response) response.status(500).send('Something went wrong');
}

function MakeCard(card) {
  this.name = card.name;
  this.type = card.type;
  this.class = card.playerClass;
  this.cost = card.cost;
  this.img = card.img;
}

function saveCards() {
}

// bcrypt hash notation - use callback to store in DB

// bcrypt.hash('password', saltRounds, function(err, hash) {
//   console.log(hash);
// });

/* console log if server lives */ 
app.listen(PORT, () => console.log(`IT LIVES!!! on ${PORT}`));