'use strict';

// Dependencies
const express = require('express');
const superagent = require('superagent');
const pg = require('pg');

// Environment variables
require('dotenv').config();
const PORT = process.env.PORT || 2021;

// Setup application
const app = express();
const client = new pg.Client(process.env.DATABASE_URL);

app.set('view engine', 'ejs');
app.use(express.static('./public'));
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', homeHandler);

// Route Handlers
function homeHandler(req, res) {
  res.status(200).render('index.ejs');
}

























// -------- Board Game Stuff --------------//

/*
https://api.boardgameatlas.com/api/search?order_by=popularity&ascending=false&client_id=JLBr5npPhV
https://www.boardgameatlas.com/search/


*/
app.get('/boardgames', (req, res) => {
  console.log('You made it to Games');
  res.render('pages/boardgames');
});

app.post('/gameresults', bgamesSearch);

function bgamesSearch(req, res) {
  console.log('Function Commit');
  // console.log('Response = ', res);  // this works
  const clientID = process.env.CLIENT_ID;
  const title = ('title = ', req.body.gamename);
  console.log('This Search=', title);
  const bgamesURL = `https://api.boardgameatlas.com/api/search?name=${title}&client_id=${clientID}`;
  // const bgamesURL = `https://api.boardgameatlas.com/api/search?name=Pirates&client_id=${clientID}`;
  console.log('Search Games URL: ', bgamesURL);

  // superagent.get(bgamesURL)
  //   .then(game => {
  //     let gameInfo = game.games.map(gameData => {
  //       return new Boardgames(gameData.games);
  //     });
  // res.status(200).render('pages/gameresults', {searchGames: gameInfo});
  res.status(200).render('pages/gameresults');
  // })
  // .catch(error => (req, res, error));
}

/* ------------- boardgames constructor ----------*/

function Boardgames(obj) {
  this.name = obj.games.name;
  this.min_players = obj.games.min_players;
  this.max_players = obj.games.max_players;
  this.image = obj.games.images.small; // use small image
}



























// -------- Trivia Stuff --------------//






























// -------- Playlist Stuff --------------//



































// Connect to DB & start the server
client.connect()
  .then(() => app.listen(PORT, () => console.log(`Server now listening on port ${PORT}.`)))
  .catch(err => console.log('ERROR:', err));
