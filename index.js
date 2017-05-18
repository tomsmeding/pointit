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
primus.plugin('mirage', require('mirage'));
primus.plugin('emit', require('primus-emit'));

function getFile (name) {
	return path.join(__dirname, name);
}

app.use(express.static('./app/dist/'));
primus.save(getFile('app/dist/_primus.js'));

app.get('/', function (req, res) {
	res.sendFile(getFile('index.html'));
});

// TODO: DEBUG ROUTE, REMOVE!!!
app.get('/games', function (req, res) {
	res.json(_.values(games));
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
	// TODO: show page where you can customize game settings.
	const settings = { minimalPlayers: 1 };
	res.redirect(`/${generateGame(settings).id}`);
});
app.get('/:id', function (req, res) {
	res.sendFile(getFile('app/src/client.html'));
});
app.get('/spec/:id', function (req, res) {
	res.sendFile(getFile('app/src/spec.html'));
});

primus.on('connection', function (spark) {
	let handler;

	console.log('connection! mirage id', spark.mirage);

	spark.on('data', function (data) {
		if (handler == null && data.type === 'hello') {
			const connection = new Connection(spark);
			let game, player;

			const pair = _.chain(games)
				.values()
				.map(game => {
					const player = _.find(game.players, p => {
						return p.connection.id === connection.id;
					});
					return [ game, player ];
				})
				.find(([ ,player ]) => player != null)
				.value();

			if (pair == null) {
				player = new Player(connection);
				console.log('creating new player');
			} else {
				[ game, player ] = pair;
				console.log('resuming old player');
				player.connection = connection;
				player.setDisconnected(false);
			}

			connection.reply(data.id, 'res', null, player);

			handler = messageHandler(player, game);

			player.connection.on('end', function () {
				player.setDisconnected(true);
			});
		} else if (handler != null) {
			handler(data);
		}
	});
});

server.listen(PORT, function () {
	console.log(`listening on port ${PORT}.`);
});
