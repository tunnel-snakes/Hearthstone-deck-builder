
CREATE TABLE users (
  userId SERIAL PRIMARY KEY, 
  userName VARCHAR (100),
  password CHAR (60)
);

CREATE TABLE decks (
  decksId SERIAL PRIMARY KEY,
  deckName VARCHAR (15),
  class VARCHAR(100),
  userId INTEGER NOT NULL,
  FOREIGN KEY (userId) REFERENCES users (userId)
);

CREATE TABLE decksCards (
  decskId INTEGER NOT NULL,
  FOREIGN KEY (decskId) REFERENCES decks (decksId),
  cardsId INTEGER NOT NULL, 
  FOREIGN KEY (cardsId)  REFERENCES cards (cardsId)
);

CREATE TABLE cards (
  cardsId SERIAL PRIMARY KEY,
  name VARCHAR (255),
  type VARCHAR (255),
  class VARCHAR (255),
  cost INTEGER NOT NULL,
  img VARCHAR (255)

);