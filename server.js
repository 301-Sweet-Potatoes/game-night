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
const client = new pg.Client(process.env.DATABASE_URL);

app.set('view engine', 'ejs');
app.use(express.static('./public'));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

// Routes
app.get('/', homeHandler);
app.get('/favorites', favoritesHandler);

// Route Handlers
function homeHandler(req, res) {
  res.status(200).render('index.ejs');
}

function favoritesHandler(req, res) {
  const SQLPLAYLIST = 'SELECT * FROM playlist;';
  const SQLBOARDGAMES = 'SELECT * FROM boardgames;';
  const SQLTRIVIA = 'SELECT * FROM trivia;';
  // LJ: this will need to be restructured when the next person adds their query.
  // See savePlaylistHandler for nested client queries
  client.query(SQLPLAYLIST)
    .then((playlist) => {
      client.query(SQLBOARDGAMES)
        .then((boardgame) => {
          client.query(SQLTRIVIA)
            .then((trivia) => {
              res.status(200).render('pages/favorites', { playlist: playlist.rows[0], boardgames: boardgame.rows, trivia: trivia.rows })
            })
            .catch(err => errorHandler(req, res, err))
        })
        .catch(err => errorHandler(req, res, err))
    })
    .catch(err => errorHandler(req, res, err));
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
app.post('/favorites', addBG);
app.delete('/favorites/favgames', removeBGames);


function bgamesSearch(req, res) {
  const clientID = process.env.MEMBER_ID;
  const title = ('title = ', req.body.gamename);
  console.log('Game Title = ', title);
  // let bgOrderBy = (req.body.orderby);
  let bgamesURL = `https://api.boardgameatlas.com/api/search?name=${title}&client_id=${clientID}&limit=10`;


  // TODO:   STRETCH GOAL: add back the orderby Trending and Ranking

  // if (req.body.orderby === 'trending' || 'rank') {
  //   let bgamesURL = `https://api.boardgameatlas.com/api/search?order_by=${bgOrderBy}&client_id=${clientID}&limit=10`;

  // } else {
  //   (req.body.orderby === 'title')
  //   let bgamesURL = `https://api.boardgameatlas.com/api/search?order_by=${title}&client_id=${clientID}&limit=10`;
  // }
  /* ---------------------------------------------------------------*/

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


function addBG(req, res) {
  const gameid = req.body.gameid;
  console.log('Add gameid = ', gameid);
  const gamename = req.body.name;
  const minplay = req.body.min_players;
  const maxplay = req.body.max_players;
  const image = req.body.image_url;
  const descript = req.body.description;

  const addSQL = `INSERT INTO boardgames (gameid, gamename, min_players, max_players, image_url, game_description) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`;
  const values = [gameid, gamename, minplay, maxplay, image, descript];
  client.query(addSQL, values)
    .then(() => res.status(200).redirect('/favorites'));

}

function removeBGames(req, res) {
  console.log('you made it to remove game!');
  console.log('Remove ', req.body);
  const delGame = req.body.gameid;
  console.log('del gameid = ', delGame);
  // DELETE FROM boardgames WHERE gameid = 'yKJz4SjHER';
  const delSQL = `DELETE FROM boardgames WHERE gameid = $1 RETURNING *;`;
  const values = [delGame];
  client.query(delSQL, values)
    .then(() => res.status(200).redirect('/favorites'))
    .catch(err => errorHandler(req, res, err));
}

function Boardgames(obj) {
  this.gameid = obj.id;
  this.name = obj.name;
  this.min_players = obj.min_players || 'Not Reported';
  this.max_players = obj.max_players || 'Not Reported';
  this.image_url = obj.images.small; // use small image
  this.description = obj.description_preview || 'No description found';
}



























// -------- Trivia Stuff --------------//

// Routes
app.get('/trivia', triviaQuestions);
app.post('/triviaresults', searchTrivia);
app.post('/favorites', addtodb);
app.delete('/favorites/deletetrivia', deleteTrivia);

// Setup



// Handlers

function deleteTrivia(req, res) {
  console.log('ready to delete');
}




function triviaQuestions(req, res) {
  console.log('made it to trivia questions');

  res.render('pages/trivia');
}

function addtodb(req, res) {
  const category = req.body.category;
  console.log('hello! you just saved a question', category);
  const correctanswer = req.body.answer;
  const question = req.body.question;
  let SQL = 'INSERT INTO trivia (category, question, correctanswer) VALUES ($1, $2, $3) RETURNING *;';
  let values = [category, question, correctanswer];

  client.query(SQL, values)
    .then(() => res.status(200).redirect('/favorites'));

}


function searchTrivia(req, res) {
  //pass variables into the url
  //amount=${value}


  const triviaURL = `https://opentdb.com/api.php?amount=2&category=9&difficulty=easy&type=boolean`;
  console.log('Search Trivia URL: ', triviaURL);
  console.log('Function Commit');
  // console.log('Response = ', res);
  superagent.get(triviaURL)
    .then(trivia => {
      let result = trivia.body.results;
      let triviaQuestions = result.map(triviaData => {
        return new Trivia(triviaData);
      });
      console.log('TrivaQuestions ', triviaQuestions);
      res.status(200).render('pages/triviaresults', { triviaData: triviaQuestions });
      // res.status(200).render('pages/triviaresults');
    })
    .catch(err => errorHandler(req, res, err));
}


// function searchTrivia(req, res) {
//   //pass variables into the url
//   //amount=${value}


//   const triviaURL = `https://opentdb.com/api.php?amount=2&category=9&difficulty=easy&type=boolean`;
//   console.log('Search Trivia URL: ', triviaURL);
//   console.log('Function Commit');
//   // console.log('Response = ', res);
//   superagent.get(triviaURL)
//     .then(trivia => {
//       let result = trivia.body.results;
//       let triviaQuestions = result.map(triviaData => {
//         return new Trivia(triviaData);
//       });
//       console.log('TrivaQuestions ', triviaQuestions);
//       res.status(200).render('pages/triviaresults', { triviaData: triviaQuestions });
//       // res.status(200).render('pages/triviaresults');
//     })
//     .catch(err => errorHandler(req, res, err));
// }


// Constructor for trivia

function Trivia(obj) {
  this.category = obj.category;
  this.question = obj.question;
  this.correctanswer = obj.correct_answer;
}























// -------- Playlist Stuff --------------//

// Setup
const SpotifyWebApi = require('spotify-web-api-node');
const { render } = require('ejs');
const SPOTIFY_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const spotifyApi = new SpotifyWebApi({ clientId: SPOTIFY_ID, clientSecret: SPOTIFY_SECRET });

// Routes
app.get('/playlist', playlistHandler);
app.post('/playlist', searchPlaylistHandler);
app.post('/favorites/playlist', savePlaylistHandler);
app.delete('/favorites/playlist', deletePlaylistHandler);

// Handlers
function errorHandler(req, res, err) { res.status(500).send(`Error: ${err}`); }

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


// Constructor
function Playlist(obj) {
  this.description = obj.description;
  this.url = obj.external_urls.spotify;
  this.image = obj.images[0].url;
  this.name = obj.name;
  this.spotifyId = obj.id;
}

// -------- End Playlist Stuff --------------//

// Connect to DB & start the server
client.connect()
  .then(() => app.listen(PORT, () => console.log(`Server now listening on port ${PORT}.`)))
  .catch(err => console.log('ERROR:', err));
