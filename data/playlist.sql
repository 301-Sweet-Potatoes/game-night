DROP TABLE IF exists playlist;


CREATE TABLE playlist (
  id SERIAL PRIMARY KEY,
  description VARCHAR(3000),
  url VARCHAR(255),
  image VARCHAR(255),
  name VARCHAR(255),
  spotifyid VARCHAR(255)
);