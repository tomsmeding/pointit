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
	res.sendFile(getFile('app/src/index.html'));
});

primus.on('connection', function (spark) {
	let handler;

	spark.on('data', function (data) {
		if (handler == null && data.type === 'hello') {
			const connection = new Connection(spark);
			connection.currentId = data.id;

			const reply = (e, r) => connection.reply(data.id, 'res', e, r);

			let player;
			let game;

			const method = data.args[0];
			if (method === 'new') {
				player = new Player(connection);
			} else if (method === 'resume') {
				[ game, player ] = _.chain(games)
					.values()
					.map(game => {
						const player = _.find(game.players, {
							privateKey: data.args[1],
						});
						return [ game, player ];
					})
					.find(([ ,player ]) => player != null)
					.value();

				if (player == null) {
					reply('invalid-key', null);
					return;
				}

				player.connection = connection;
			} else {
				reply('unknown-method', null);
				return;
			}

			reply(null, (function () {
				const res = player.toJSON();
				res.privateKey = player.privateKey;
				return res;
			})());

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
