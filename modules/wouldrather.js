const { Module } = require('../module.js');
const _ = require('lodash');

const questions = [
	'Who would rather lie about getting laid?',
].map((question, i) => ({
	index: i,
	question,
}));

module.exports = class WouldRather extends Module {
	constructor(options) {
		super(options);
	}

	next() {
		this.current++;
	}

	getCurrent(player) {
		return {
			question: questions[this.current],
			answers: this.players.filter(p => p.id !== player.id),
		};
	}

	async checkAnswer(player, answerId) {
		throw new Error('not implemented');

		this.answers.push(answer);

		const promise = new Promise((resolve, reject) => {
			this.callbacks.push([ resolve, reject ]);
		});

		return promise;
	}
}

module.exports.friendly = 'Would Rather';
