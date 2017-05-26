const { Module } = require('../module.js');
const { multiMax } = require('../util.js');
const _ = require('lodash');

module.exports = class WhoIsGonnaWin extends Module {
	constructor(game, getCallback) {
		super(game);
		game.on('game.prefinish', getCallback());
	}

	getCurrent() {
		return {
			question: 'Who is going to win this game?',
			type: 'players',
			answers: this._players(),
		};
	}

	checkAnswer({ player }) {
		const answerId = this.getAnswer(player);
		const correctAnswers = multiMax(this.game.players, 'points');
		return _.some(correctAnswers, p => p.id === answerId);
	}
}

module.exports.friendly = 'Who\'s gonna win';
