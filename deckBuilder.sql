
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS decks;
DROP TABLE IF EXISTS cards;
DROP TABLE IF EXISTS decksCards;

CREATE TABLE users (
  userId SERIAL PRIMARY KEY, 
  userName VARCHAR(100),
  password CHAR(60)
);

CREATE TABLE decks (
  decksId SERIAL PRIMARY KEY,
  deckName VARCHAR(15),
  class VARCHAR(100),
  userId BIGINT,
  FOREIGN KEY (userId) REFERENCES users(userId)
);

CREATE TABLE cards (
  cardsId SERIAL PRIMARY KEY,
  name VARCHAR(255),
  type VARCHAR(255),
  class VARCHAR(255),
  cost INTEGER NOT NULL,
  img VARCHAR(255)
);

CREATE TABLE decksCards (
  decksId BIGINT,
  cardsId BIGINT,
  FOREIGN KEY (decksId) REFERENCES decks (decksId), 
  FOREIGN KEY (cardsId) REFERENCES cards (cardsId)
);

