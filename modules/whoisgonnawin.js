const { Module } = require('../module.js');
const _ = require('lodash');

module.exports = class WhoIsGonnaWin extends Module {
	constructor(game, getCallback) {
		super(game);
		game.on('finish', getCallback());
	}

	getCurrent() {
		return {
			question: 'Who is going to win this game?',
			answers: this._players(),
		};
	}

	checkAnswer({ player }) {
		const answerId = this.getAnswer(player);
		const correct = _.max(this.game.players, 'points').id;
		return answerId === correct;
	}
}

module.exports.friendly = 'Who\'s gonna win';
