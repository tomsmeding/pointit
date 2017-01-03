const PORT = 1337;

const Primus = require('primus');
const express = require('express');
const http = require('http');
const { generateGame, games } = require('./room.js');

const app = express();
const server = http.createServer(app);

const primus = new Primus(server, { transformer: 'websockets' });

app.use(express.static('static'));

app.get('/', function (req, res) {
	res.sendFile(__dirname + '/static/html/index.html');
});

app.param('id', function (req, res, next, id) {
	const game = games[id];
	if (game === undefined) {
		res.status(404).end('game not found lol xD');
		return;
	}
	req.game = game;
	next();
});
app.get('/game/create', function (req, res) {
	res.redirect(`/game/${generateGame().id}`);
});
app.get('/game/:id', function (req, res) {
	res.end(req.game.id);
});

server.listen(PORT, function () {
	console.log(`listening on port ${PORT}.`);
});
