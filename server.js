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

//Error
function handleError (error, response) {
  console.log('error', error);
  if(response) response.status(500).send('Something went wrong');
}

// bcrypt hash notation - use callback to store in DB

// bcrypt.hash('password', saltRounds, function(err, hash) {
//   console.log(hash);
// });

/* console log if server lives */ 
app.listen(PORT, () => console.log(`IT LIVES!!! on ${PORT}`));