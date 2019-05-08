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
  res.render('pages/login');
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
  res.render('pages/builder');
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

// async function getFromAPI(query) {
//   console.log('Getting data from API');

//   let results = [];
//   let url = `https://omgvamp-hearthstone-v1.p.rapidapi.com/${query}`;

//   superagent.get(url)
//     .set('X-RapidAPI-Host', 'omgvamp-hearthstone-v1.p.rapidapi.com')
//     .set('X-RapidAPI-Key', HEARTHSTONE_API_KEY)
//     .then(data => {

//       let cardSets = [];
//       Object.keys(data.body).forEach(cardSet => {
//         cardSets.push(cardSet);
//       });
//       cardSets = cardSets.slice(0,19);
//       for(let i = 0; i < cardSets.length; i++) {
//         data.body[cardSets[i]].forEach(card => {
//           if(card.type === 'Minion' && card.collectible === true || card.type === 'Spell' && card.collectible === true || card.type === 'Weapon' && card.collectible === true) {
//             let newCard = new MakeCard(card);
//             //saveCards(newCard);
//             results.push(newCard);
//             //console.log(results);
//           } else {
//             // do nothing
//           }
//         });
//       }
//     });
//     return results;
// }


//Error
function handleError (error, response) {
  console.log('error', error);
  if(response) response.status(500).send('Something went wrong');
}

/* console log if server lives */
app.listen(PORT, () => console.log(`IT LIVES!!! on ${PORT}`));