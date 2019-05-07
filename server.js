'use strict';

require('dotenv').config();
const superagent = require('superagent');
const { Client } = require('pg');
const express = require('express'),
  app = express(),
  PORT = process.env.PORT || 3000,
  HEARTHSTONE_API_KEY = process.env.HEARTHSTONE_API_KEY;


const client = new Client(process.env.DATABASE_URL);
client.connect();
client.on('error', error => console.log(error));

/* console log if server lives */ 
app.listen(PORT, () => console.log(`IT LIVES!!! on ${PORT}`));