
DROP TABLE IF EXISTS deckCards;
DROP TABLE IF EXISTS cards;
DROP TABLE IF EXISTS decks;
DROP TABLE IF EXISTS users;


CREATE TABLE users (
  userId SERIAL PRIMARY KEY, 
  userName VARCHAR(100),
  password CHAR(60)
);

CREATE TABLE decks (
  deckId SERIAL PRIMARY KEY,
  deckName VARCHAR(15),
  class VARCHAR(100),
  userId BIGINT,
  FOREIGN KEY (userId) REFERENCES users(userId)
);

CREATE TABLE cards (
  cardId SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  type VARCHAR(255),
  class VARCHAR(255),
  cost INTEGER NOT NULL,
  img VARCHAR(255),
  rarity VARCHAR (200)
);

CREATE TABLE deckCards (
  deckId BIGINT,
  cardId BIGINT,
  quantity INTEGER NOT NULL,
  FOREIGN KEY (deckId) REFERENCES decks (deckId), 
  FOREIGN KEY (cardId) REFERENCES cards (cardId),
  UNIQUE (deckId, cardId)
);

