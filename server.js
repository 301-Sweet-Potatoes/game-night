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

app.get('/favorites', (req, res) => {
  res.render('pages/favorites');

});

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
  console.log('Function Boardgame Seach');
  const clientID = process.env.CLIENT_ID;
  const title = ('title = ', req.body.gamename);
  console.log('This Search=', title);
  const bgamesURL = `https://api.boardgameatlas.com/api/search?name=${title}&client_id=${clientID}`;
  console.log('Search Games URL: ', bgamesURL);

  superagent.get(bgamesURL)
    .then(game => {
      let gameInfo = game.body.games.map(gameData => {
        return new Boardgames(gameData);
      });
      res.status(200).render('pages/gameresults', { gameInfo });
    })
    .catch(err => errorHandler(req, res, err));
}

/* ------------- boardgames constructor ----------*/

function Boardgames(obj) {
  this.name = obj.name;
  this.min_players = obj.min_players || 'Not Reported';
  this.max_players = obj.max_players || 'Not Reported';
  this.image = obj.images.small; // use small image
  this.description = obj.description_preview || 'No description found';
}



























// -------- Trivia Stuff --------------//






























// -------- Playlist Stuff --------------//

// Setup
const SpotifyWebApi = require('spotify-web-api-node');
const SPOTIFY_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const spotifyApi = new SpotifyWebApi({ clientId: SPOTIFY_ID, clientSecret: SPOTIFY_SECRET });


// Routes
app.get('/playlist', playlistHandler);
app.post('/playlist', searchPlaylistHandler);


// Handlers
function errorHandler(req, res, err) {
  res.status(500).send(`Error: ${err}`);
}

function playlistHandler(req, res) {
  res.status(200).render('pages/playlist');
}

function searchPlaylistHandler(req, res) {
  let search = req.body.search;
  spotifyApi.clientCredentialsGrant()
    .then(data => {
      spotifyApi.setAccessToken(data.body['access_token']);
      spotifyApi.searchPlaylists(search, { limit: 3 })
        .then(data => {
          let playlists = data.body.playlists.items.map(playlist => new Playlist(playlist));
          res.status(200).render('pages/playlist', { playlists });
        })
        .catch(err => errorHandler(req, res, err));
    })
    .catch(err => errorHandler(req, res, err));
}


function Playlist(obj){ 
  this.description = obj.description;
  this.url = obj.external_urls.spotify;
  this.image = obj.images[0].url;
  this.name = obj.name;
  this.spotifyId = obj.id;
}




























// Connect to DB & start the server
client.connect()
  .then(() => app.listen(PORT, () => console.log(`Server now listening on port ${PORT}.`)))
  .catch(err => console.log('ERROR:', err));
