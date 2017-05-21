const { Module } = require('../module.js');
const _ = require('lodash');

const questions = [
	'Who would rather lie about getting laid?',
];

module.exports = class WouldRather extends Module {
	constructor(options) {
		super(options);
		this.current = -1;
		this.next();
	}

	next() {
		this.current++;
		this.callbacks = []; // REVIEW
		this.answers = [];
		return this.current < questions.length;
	}

	getCurrent(player) {
		return {
			question: questions[this.current],
			type: 'players',
			answers: this._players(player),
		};
	}

	_ready() {
		return this.answers.length === this.game.activePlayers().length;
	}

	_checkAnswer(player) {
		const pair = _.chain(this.answers)
			.groupBy('answerId')
			.toPairs()
			.max(pair => pair[1].length)
			.value();
		const answerId = this.getAnswer(player);
		return pair[1] === answerId;
	}

	provideAnswer(options) {
		super.provideAnswer(options);

		if (this._ready()) {
			for (const { player, resolve } of this.callbacks) {
				resolve(this._checkAnswer(player));
			}
			this.callbacks = [];
		}
	}

	async checkAnswer({ player }) {
		if (this._ready()) {
			return this._checkAnswer(player);
		}

		return new Promise((resolve, reject) => {
			this.callbacks.push({
				player,
				resolve,
				reject,
			});
		});
	}
}

module.exports.friendly = 'Would Rather';
