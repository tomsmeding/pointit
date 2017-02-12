const { uid } = require('./util.js')

var games = {};

class Game {
	constructor(id) {
		this.id = id;
		this.players = [];
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
