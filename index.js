const PORT = 1337;

const _ = require('lodash');
const Primus = require('primus');
const express = require('express');
const http = require('http');
const path = require('path');
const { generateGame, getGame, games } = require('./room.js');
const Player = require('./player.js');
const Connection = require('./connection.js');
const messageHandler = require('./messageHandler.js');

const app = express();
const server = http.createServer(app);

const primus = new Primus(server, { transformer: 'websockets' });

function getFile (name) {
	return path.join(__dirname, name);
}

app.use(express.static('./app/dist/'));
primus.save(getFile('app/dist/_primus.js'));

app.get('/', function (req, res) {
	res.sendFile(getFile('index.html'));
});

app.param('id', function (req, res, next, id) {
	const game = getGame(id);
	if (game === undefined) {
		res.redirect('/#error');
		return;
	}
	req.game = game;
	next();
});
app.get('/creategame', function (req, res) {
	res.redirect(`/${generateGame().id}`);
});
app.get('/:id', function (req, res) {
	res.sendFile(getFile('app/src/index.html'));
});

primus.on('connection', function (spark) {
	const player = new Player(new Connection(spark));

	player.connection.send('hello', player);

	player.connection.on('data', messageHandler(player));
	player.connection.on('end', function () {
		_.chain(games)
			.values()
			.filter(g => g.players.some(p => p.id === player.id))
			.value()
			.forEach(g => g.removePlayer(player));
	});
});

server.listen(PORT, function () {
	console.log(`listening on port ${PORT}.`);
});
