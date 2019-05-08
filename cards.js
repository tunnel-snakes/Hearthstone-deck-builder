'use strict';

require('dotenv').config();
const superagent = require('superagent');
const { Client } = require('pg');

const client = new Client(process.env.DATABASE_URL);
client.connect();
client.on('error', error => console.log(error));


/* this is our card object we can add more filters by adding more get functions if we have time */
const cards = {
  getCardByClass : function(className) {
    let validCards = [];
    let url = `https://omgvamp-hearthstone-v1.p.rapidapi.com/cards/classes/${className}`;

    return superagent.get(url)
      .set('X-RapidAPI-Host', 'omgvamp-hearthstone-v1.p.rapidapi.com')
      .set('X-RapidAPI-Key', process.env.HEARTHSTONE_API_KEY)
      .then(data => {
        data.body.forEach(card => {
          if(card.hasOwnProperty('collectible') && card.collectible === true && (card.type === 'Minion' || card.type === 'Spell' || card.type === 'Weapon')){
            let currentCard = {
              name : card.name,
              type : card.type,
              class : card.playerClass,
              cost : card.cost,
              img : card.img,
              rarity : card.rarity
            };
            validCards.push(currentCard);
          }
        });
        return validCards;
      });
  },
  /* this is to save a single card to a deckId we still need to limit to 30 cards */
  saveCard : function(cardObject, deckId) {
    let sql1 = `INSERT INTO cards (name, type, class, cost, img, rarity)
                VALUES ($1, $2, $3, $4 ,$5, $6)
                ON CONFLICT do nothing`;
    client.query(sql1, [cardObject.name, cardObject.type, cardObject.class, cardObject.cost, cardObject.img, cardObject.rarity])
      .then(()=> {
        let sql2 = 'SELECT cardsId from cards WHERE name = $1';
        return client.query(sql2, [cardObject.name]);
      }).then(result => {
        let cardId = result[0];
        let sql3 = '';
        if(cardObject.rarity === 'Legendry'){
          sql3 = `INSERT INTO decksCards(deckId, cardId, quantity)
                  VALUES ($1, $2, 1)
                  ON CONFLICT do nothing`;
        }
        else {
          sql3 = `INSERT INTO decksCards(deckId, cardId, quantity)
                  VALUES ($1, $2, 1)
                  ON CONFLICT do update SET quantity = 2`;
        }
        return client.query(sql3, [deckId, cardId]);
      }).catch(error => console.error(error));
  }

};

module.exports = cards;


