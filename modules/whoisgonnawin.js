const { Module } = require('../module.js');
const _ = require('lodash');

module.exports = class WhoIsGonnaWin extends Module {
	constructor(options) {
		super(options);
		this.stepAnswerReady = 'game-end';
	}

	getCurrent() {
		return {
			question: 'Who is going to win this game?',
			answers: this.game.players.map(p => ({
				id: p.id,
				text: p.nickname,
			})),
		};
	}

	checkAnswer({ player, game }) {
		const answerIndex = this.getAnswer(player);
		const correct = _.max(game.players, 'points');
		return this.players[answerIndex].id === correct.id;
	}
}

module.exports.friendly = 'Who\'s gonna win';
