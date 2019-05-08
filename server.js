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

const client = new Client(process.env.DATABASE_URL);
client.connect();
client.on('error', error => console.log(error));

app.get('/', function(req, res) {
  res.render('pages/login');
});

app.get('/home', function(req, res) {
  res.render('pages/home');
});

app.get('/signUp', function(req, res) {
  res.render('pages/signUp');
});

app.get('/decks', function(req, res) {
  res.render('decks');
});

app.get('/builder', function(req, res) {
  console.log(checkDatabase());
  //console.log(results);
  //res.render('builder', {data: results});
});

app.get('/aboutUs', function(req, res) {
  res.render('aboutUs');
});

app.get('*', function(req, res) {
  res.render('pages/error');
});


const client = new Client(process.env.DATABASE_URL);
client.connect();
client.on('error', error => console.log(error));

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

// // create danny devito card
// let SQL1 = `INSERT INTO cards (name, type, class, cost, img) VALUES($1, $2, $3, $4, $5)`;
// let values1 = ['Danny Devito', 'Minion', 'Warrior', 10, 'https://www.magnumdong.gov'];
// client.query(SQL1, values1);

// create user
// let SQL2 = "INSERT INTO users (userName, password) VALUES($1, $2)";
// let values2 = ['Ian Smith', 'password'];
// client.query(SQL2, values2);

// // create deck for user 1
// let SQL3 = `INSERT INTO decks (deckName, class, userId) VALUES($1, $2, $3)`;
// let values3 = ['Deck 1', 'Warrior', 1];
// client.query(SQL3, values3);

// // put card into deckCards
// let SQL4 = `INSERT INTO decksCards (decksId, cardsId) VALUES($1, $2)`;
// let values4 = [1, 1];
// client.query(SQL4, values4);

async function getFromAPI(query) {
  console.log('Getting data from API');

  let results = [];
  let url = `https://omgvamp-hearthstone-v1.p.rapidapi.com/${query}`;

  superagent.get(url)
    .set('X-RapidAPI-Host', 'omgvamp-hearthstone-v1.p.rapidapi.com')
    .set('X-RapidAPI-Key', HEARTHSTONE_API_KEY)
    .then(data => {

      let cardSets = [];
      Object.keys(data.body).forEach(cardSet => {
        cardSets.push(cardSet);
      });
      cardSets = cardSets.slice(0,19);
      for(let i = 0; i < cardSets.length; i++) {
        data.body[cardSets[i]].forEach(card => {
          if(card.type === 'Minion' && card.collectible === true || card.type === 'Spell' && card.collectible === true || card.type === 'Weapon' && card.collectible === true) {
            let newCard = new MakeCard(card);
            //saveCards(newCard);
            results.push(newCard);
            //console.log(results);
          } else {
            // do nothing
          }
        });
      }
    });
    return results;
}


function getFromDataBase() {
  console.log('got stuff from db');
}


function checkDatabase() {
  console.log('Checking database');
  let SQL = 'SELECT * FROM cards;';
  client.query(SQL)
    .then(results => {
      //return getFromAPI('cards');
      if(results.rowCount > 0) {
        console.log(getFromAPI('cards'));
        //return getFromDataBase(results);
      } else {
        return getFromAPI('cards');
      }
    });
}
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

function saveCards(input) {
  const sql = `INSERT INTO cards (name, type, class, cost, img)
                VALUES ($1, $2, $3, $4, $5)`;
  client.query(sql, [input.name, input.type, input.class, input.cost, input.img]);
}

// bcrypt hash notation - use callback to store in DB


/* console log if server lives */
app.listen(PORT, () => console.log(`IT LIVES!!! on ${PORT}`));