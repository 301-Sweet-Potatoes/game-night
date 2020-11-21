DROP TABLE IF EXISTS boardgames;

CREATE TABLE boardgames(
id SERIAL PRIMARY KEY,
gamename VARCHAR(255),
min_players SMALLINT,
max_players SMALLINT,
image_url VARCHAR(255),
game_description VARCHAR
);

