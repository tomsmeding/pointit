const { uniqid } = require('./util.js')
const uid = require('uid-safe')

var games = {};

class Game {
	constructor(id) {
		this.id = id;
		this.players = [];
	}
}

function generateGame() {
	var id = uid.sync(6);
	const game = new Game(id);
	games[id] = game;
	return game;
}

module.exports = {
	games,
	Game,
	generateGame,
};
