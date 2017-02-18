const _ = require('lodash');
const { uid } = require('./util.js');

var games = {};

class Game {
	constructor(id) {
		this.id = id;
		this.players = [];
	}

	addPlayer(player) {
		const id = player.id;

		if (this.players.some(p => p.id === id)) {
			throw new Error('player already in game');
		}

		this.broadcast('join', id);
		this.players.push(player);
	}

	removePlayer(player) {
		const id = player.id;

		if (!this.players.some(p => p.id === id)) {
			throw new Error('player not in game');
		}

		_.remove(this.players, { id });
		this.broadcast('leave', id);
	}

	broadcast(type, ...args) {
		this.players.forEach(p => p.send(type, this.id, ...args))
	}
}

function generateGame() {
	var id = uid();
	const game = new Game(id);
	games[id] = game;
	return game;
}

module.exports = {
	games,
	Game,
	generateGame,
};
