DROP TABLE IF EXISTS boardgames;

CREATE TABLE boardgames(
id SERIAL PRIMARY KEY,
gameid VARCHAR(255),
gamename VARCHAR(255),
min_players SMALLINT,
max_players SMALLINT,
image_url VARCHAR(255),
game_description VARCHAR
);

INSERT INTO
boardgames (gameid, gamename, min_players, max_players, image_url, game_description)
VALUES
('yKJz4SjHER', 'Trash Pandas', '2', '4', 'https://d2k4q26owzy373.cloudfront.net/150x150/games/uploaded/1540095486074', 'Trash is treasure! In this raucous card game, paw through the deck to find sets of day-old pizza, half-eaten candy, and other luscious leftovers. Roll the die to tip over the garbage or raid a rivals rubbish, if theres no Doggos standing guard. The more you roll, the more actions you can take - but get too greedy and your turn is scrapped! Stash the most trash and youre pick of the litter!');