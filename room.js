const _ = require('lodash');
const { uid } = require('./util.js');

var games = {};

class Game {
	/**
	 * @param {String} id
	 * @param {Object} [settings]
	 */
	constructor(id, settings) {
		this.id = id;
		this.players = [];
		this.settings = _.defaults(settings, {
			mode: 'point', // one of: point, list
			countdownTime: 5, // in seconds
			minimalPlayers: 3,
		});
	}

	/**
	 * @param {Player} player
	 */
	addPlayer(player) {
		const id = player.id;

		if (this.players.some(p => p.id === id)) {
			throw new Error('player already in game');
		}

		this.players.push(player);
		this.broadcast('game.join', player);
	}

	/**
	 * @param {Player} player
	 */
	removePlayer(player) {
		const id = player.id;

		if (!this.players.some(p => p.id === id)) {
			throw new Error('player not in game');
		}

		_.remove(this.players, { id });
		this.broadcast('game.leave', id);
	}

	/**
	 * Broadcasts a message with the given type, the current room id and args to
	 * every player in this room.
	 * @param {String} type
	 * @param {String} [args...]
	 */
	broadcast(type, ...args) {
		for (const player of this.players) {
			player.send(type, this.id, ...args);
		}
	}
}

/**
 * @return {Game}
 */
function generateGame() {
	var id = uid().toUpperCase();
	// const game = new Game(id);
	const game = new Game(id, { minimalPlayers: 1 });
	games[id] = game;
	return game;
}

/**
 * @param {String} id
 * @return {Game}
 */
function getGame(id) {
	return games[id.toUpperCase()];
}

module.exports = {
	games,
	Game,
	generateGame,
	getGame,
};
