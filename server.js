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
app.get('/boardgames', bgamesSearch);

function bgamesSearch (req, res) {
  console.log('Function Commit');
  console.log('Response = ', res);
  const clientID = process.env.CLIENT_ID;
  const title = ('title = ', res.body.gamename);
  console.log('This Search=', title);
  // const bgamesURL = `https://api.boardgameatlas.com/api/search?name=${ title }&client_id=${ clientID }`;
  const bgamesURL = `https://api.boardgameatlas.com/api/search?name=Pirates&client_id=${ clientID }`;
  console.log('Search Games URL: ', bgamesURL);
  res.status(200).render('pages/boardgames');
}





























// -------- Trivia Stuff --------------//






























// -------- Playlist Stuff --------------//



































// Connect to DB & start the server
client.connect()
  .then(() => app.listen(PORT, () => console.log(`Server now listening on port ${PORT}.`)))
  .catch(err => console.log('ERROR:', err));
