'use strict';

// Dependencies
const express = require('express');
const superagent = require('superagent');
const pg = require('pg');
const methodOverride = require('method-override');

// Environment variables
require('dotenv').config();
const PORT = process.env.PORT || 2021;

// Setup application
const app = express();
const { render } = require('ejs');
const client = new pg.Client(process.env.DATABASE_URL);
const SpotifyWebApi = require('spotify-web-api-node');
const spotifyApi = new SpotifyWebApi({ clientId: SPOTIFY_ID, clientSecret: SPOTIFY_SECRET });
const SPOTIFY_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

app.set('view engine', 'ejs');
app.use(express.static('./public'));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

// Routes
app.get('/', homeHandler);
app.get('/favorites', favoritesHandler);
app.get('/aboutus', aboutUsHandler);
app.get('/playlist', playlistHandler);
app.post('/playlist', searchPlaylistHandler);
app.post('/favorites/playlist', savePlaylistHandler);
app.delete('/favorites/playlist', deletePlaylistHandler);
app.post('/gameresults', bgamesSearch);
app.post('/favorites', addBG);
app.delete('/favorites/favgames', removeBGames);
app.get('/boardgames', boardGamesHandler);
app.get('/trivia', triviaQuestions);
app.post('/triviaresults', searchTrivia);
app.post('/triviafavs', addtodb);
app.delete('/triviafavs/deletetrivia', deleteTrivia);

// Route Handlers
function errorHandler(req, res, err) { res.status(500).send(`Error: ${err}`); }
function homeHandler(req, res) {res.status(200).render('index');}
function aboutUsHandler(req, res) { res.status(200).render('pages/aboutus'); }
function boardGamesHandler(req, res) { res.status(200).render('pages/boardgames')}

function favoritesHandler(req, res) {
  const SQLPLAYLIST = 'SELECT * FROM playlist;';
  const SQLBOARDGAMES = 'SELECT * FROM boardgames;';
  const SQLTRIVIA = 'SELECT * FROM trivia;';
  client.query(SQLPLAYLIST)
    .then((playlist) => {
      client.query(SQLBOARDGAMES)
        .then((boardgame) => {
          client.query(SQLTRIVIA)
            .then((trivia) => {
              res.status(200).render('pages/favorites', { playlist: playlist.rows[0], boardgames: boardgame.rows, trivia: trivia.rows });
            })
            .catch(err => errorHandler(req, res, err));
        })
        .catch(err => errorHandler(req, res, err));
    })
    .catch(err => errorHandler(req, res, err));
}

function playlistHandler(req, res) {
  spotifyApi.clientCredentialsGrant()
    .then(data => {
      spotifyApi.setAccessToken(data.body['access_token']);
      spotifyApi.searchPlaylists('Game Night', { limit: 3 })
        .then(data => {
          let playlists = data.body.playlists.items.map(playlist => new Playlist(playlist));
          res.status(200).render('pages/playlist', { playlists });
        })
        .catch(err => errorHandler(req, res, err));
    })
    .catch(err => errorHandler(req, res, err));
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

function savePlaylistHandler(req, res) {
  const SQLDELETE = `DELETE FROM playlist RETURNING *;`;
  const SQLINSERT = `INSERT INTO playlist (name, description, url, image, spotifyid) VALUES ($1, $2, $3, $4, $5) RETURNING *;`;
  const params = [req.body.name, req.body.description, req.body.url, req.body.image, req.body.spotifyId];

  client.query(SQLDELETE)
    .then(() => {
      client.query(SQLINSERT, params)
        .then(() => res.status(200).redirect('/favorites'))
        .catch(err => errorHandler(req, res, err));
    })
    .catch(err => errorHandler(req, res, err));
}

function deletePlaylistHandler(req, res) {
  const SQL = 'DELETE FROM playlist';

  client.query(SQL)
    .then(() => res.status(200).redirect('/favorites'))
    .catch(err => errorHandler(req, res, err));
}

function deleteTrivia(req, res) {
  const triviaId = req.body.triviaId;
  const deletetrivia = `DELETE FROM trivia WHERE id = $1 RETURNING * ;`;
  client.query(deletetrivia, [triviaId])
    .then(() => res.status(200).redirect('/favorites'))
    .catch(err => errorHandler(req, res, err));
}

function triviaQuestions(req, res) {
  const triviaURL = 'https://opentdb.com/api.php?amount=10&type=boolean';
  superagent.get(triviaURL)
    .then(trivia => {
      let result = trivia.body.results;
      let triviaQuestions = result.map(triviaData => new Trivia(triviaData));
      res.status(200).render('pages/trivia', { triviaQuestions });
    })
    .catch(err => errorHandler(req, res, err));
}

function addtodb(req, res) {
  const category = req.body.category;
  const correctanswer = req.body.answer;
  const question = req.body.question;
  let SQL = 'INSERT INTO trivia (category, question, correctanswer) VALUES ($1, $2, $3) RETURNING *;';
  let values = [category, question, correctanswer];

  client.query(SQL, values)
    .then(() => res.status(200).redirect('/favorites'))
    .catch(err => errorHandler(req, res, err));
}

function searchTrivia(req, res) {
  const triviaURL = `https://opentdb.com/api.php?amount=10&category=9&difficulty=easy&type=boolean`;
  superagent.get(triviaURL)
    .then(trivia => {
      let result = trivia.body.results;
      let triviaQuestions = result.map(triviaData => new Trivia(triviaData));
      res.status(200).render('pages/trivia', { triviaQuestions });
    })
    .catch(err => errorHandler(req, res, err));
}

function bgamesSearch(req, res) {
  const clientID = process.env.MEMBER_ID;
  const gameTitle = ('title = ', req.body.gamename);
  let bgOrderBy = (req.body.orderby);
  let bgamesURL = '';

  if (bgOrderBy === 'trending' || bgOrderBy === 'rank') {
    bgamesURL = `https://api.boardgameatlas.com/api/search?order_by=${bgOrderBy}&client_id=${clientID}&limit=10`;
  } else {
    bgamesURL = `https://api.boardgameatlas.com/api/search?name=${gameTitle}&client_id=${clientID}&limit=10`;
  }

  superagent.get(bgamesURL)
    .then(game => {
      let gameInfo = game.body.games.map(gameData => Boardgames(gameData));
      res.status(200).render('pages/gameresults', { gameInfo });
    })
    .catch(err => errorHandler(req, res, err));
}

function addBG(req, res) {
  const gameid = req.body.gameid;
  const gamename = req.body.name;
  const minplay = req.body.min_players;
  const maxplay = req.body.max_players;
  const image = req.body.image_url;
  const descript = req.body.description;

  const addSQL = `INSERT INTO boardgames (gameid, gamename, min_players, max_players, image_url, game_description) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`;
  const values = [gameid, gamename, minplay, maxplay, image, descript];
  client.query(addSQL, values)
    .then(() => res.status(200).redirect('/favorites'))
    .catch(err => errorHandler(req, res, err));

}

function removeBGames(req, res) {
  const delGame = req.body.gameid;
  const delSQL = `DELETE FROM boardgames WHERE gameid = $1 RETURNING *;`;
  const values = [delGame];
  client.query(delSQL, values)
    .then(() => res.status(200).redirect('/favorites'))
    .catch(err => errorHandler(req, res, err));
}

// Constructors
function Playlist(obj) {
  this.description = obj.description;
  this.url = obj.external_urls.spotify;
  this.image = obj.images[0].url;
  this.name = obj.name;
  this.spotifyId = obj.id;
}

function Trivia(obj) {
  this.category = obj.category;
  this.question = obj.question;
  this.correctanswer = obj.correct_answer;
}

function Boardgames(obj) {
  this.gameid = obj.id;
  this.name = obj.name;
  this.min_players = obj.min_players || 'Not Reported';
  this.max_players = obj.max_players || 'Not Reported';
  this.image_url = obj.images.small; // use small image
  this.description = obj.description_preview || 'No description found';
  this.rank = obj.rank || 'No rank Found';
  this.trending = obj.trending_rank || 'No Trend found';
}

// Connect to DB & start the server
client.connect()
  .then(() => app.listen(PORT, () => console.log(`Server now listening on port ${PORT}.`)))
  .catch(err => console.log('ERROR:', err));
