const _ = require('lodash');
const EventEmitter = require('events');
const { getModule, getModules } = require('./module.js');
const { uid, sendAndWaitAll, sleep, multiMax } = require('./util.js');

var games = {};

class Game extends EventEmitter {
	/**
	 * @param {String} id
	 * @param {Object} [settings]
	 */
	constructor(id, settings) {
		super();

		this.id = id;
		this.players = [];
		this.settings = _.defaults(settings, Game.DEFAULT_SETTINGS);

		this.modules = this.settings.enabledModules.map(name => {
			const module = getModule(name);
			return {
				name,
				module,
			}
		});
	}

	activePlayers() {
		return this.players.filter(p => !p.disconnected);
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

	async start() {
		this.started = true;
		this.broadcast('game.start');

		await sleep(250); // HACK

		const answersReady = [];

		for (let i = 0; i < this.modules.length; i++) {
			const module = this.modules[i];
			let instance;

			let callbackGiven = false;
			const getCallback = () => {
				console.log('getCallback called');
				callbackGiven = true;
				return () => {
					answersReady.push({
						module,
						instance,
					});
					console.log('callback called.', 'answersReady: ', answersReady);
				};
			};

			instance = new module.module(this, getCallback);

			// REVIEW
			this.broadcast(
				'game.module.next',
				i,
				this.modules.length,
				module.name,
				module.friendly
			);

			do {
				const targetDate = new Date();
				targetDate.setSeconds(targetDate.getSeconds() + 2);

				this.broadcast('game.interlude', targetDate.valueOf()); // TODO: reword
				await sleep(targetDate - Date.now());

				const responses = await this.broadcastAndWait(
					Infinity, // TODO: do something when users are slow, serverside
					'game.question.next',
					player => [ instance.getCurrent(player) ]
				);
				for (const response of responses) {
					instance.provideAnswer({
						player: response.player,
						answerId: response.res,
					});
				}

				if (!callbackGiven) {
					await this._checkAnswers(module, instance);
				}

				this.emit('question.done', {
					index: instance.current,
				}, {
					module: instance,
					index: i,
					length: this.modules.length,
				});
			} while(instance.next());

			const emitInfo = {
				module: instance,
				index: i,
				length: this.modules.length,
			};

			this.emit('module.prefinish', emitInfo);

			// handle all remaining ready answers for this module.
			const items = _.remove(answersReady, item => {
				return item.module === module;
			});
			for (const { module, instance } of items) {
				await this._checkAnswers(module, instance);
			}

			this.emit('module.finish', emitInfo);
		}

		this.emit('game.prefinish');

		// handle all remaining ready answers.
		const items = _.remove(answersReady);
		for (const { module, instance } of items) {
			await this._checkAnswers(module, instance);
		}

		this.broadcast('game.finish', this.players.map(p => ({
			id: p.id,
			points: p.points,
		})));

		this.emit('game.finish');
	}

	emit(type, ...args) {
		{
			let arr = [ `emitted '${type}'` ];
			if (args.length > 0) {
				arr.push('with args');
				arr = arr.concat(args);
			}
			console.log(...arr);
		}
		super.emit(type, ...args);
	}

	async _checkAnswers(module, instance) {
		// TODO: DRY this up (REVIEW: think this is done?)
		// TODO: checkAnswer (and with that the whole current answer
		// system) currently doesn't really work with multiple questions
		// per module. Fix that.

		const promises = this.activePlayers().map(p => {
			// REVIEW: replace res, with an variable Number (points being
			// given)>
			const res = instance.checkAnswer({
				player: p,
			});
			return Promise.resolve(res).then(res => [ p, res ]);
		});
		const pairs = await Promise.all(promises);
		for (const [ player, answerCorrect ] of pairs) {
			// TODO: actually wait on clients here
			player.points += answerCorrect;
			player.connection.send('answer.correct', this.id, answerCorrect);
		}
	}

	// REVIEW
	stop() {
		this.started = false;
		this.broadcast('game.stop');
	}

	/**
	 * Broadcasts a message with the given type, the current room id and args to
	 * every player in this room.
	 * @param {String} type
	 * @param {String} [args...]
	 */
	broadcast(type, ...args) {
		for (const player of this.activePlayers()) {
			player.connection.send(type, this.id, ...args);
		}
	}

	async broadcastAndWait(timeout, type, ...args) {
		const argsfn = _.isFunction(args[0]) ? args[0] : () => args;
		const wrapped = player => {
			const res = argsfn(player);
			res.unshift(this.id);
			return res;
		};

		const responses = await sendAndWaitAll(
			this.activePlayers(),
			player => {
				const args = wrapped(player);
				return player.connection.send(type, ...args);
			},
			timeout
		);

		return responses.map(res => ({
			player: res.item,
			res: res.res,
			err: res.err,
		}));
	}

	printInfo(lines) {
		console.log(`======== ${this.id} ========`);
		for (let line of lines) {
			if (!Array.isArray(line)) {
				line = [ line ];
			}
			console.log(...line);
		}
		console.log('=======================');
	}

	toJSON() {
		const fields = [
			'id',
			'players',
			'settings',
		];
		return _.pick(this, fields);
	}
}

Game.SETTINGS = {
	mode: {
		type: 'string',
		options: [ 'point', 'list' ],
		default: 'point',
		multiple: false,
	},
	countdownTime: {
		type: 'number',
		min: 1,
		default: 5,
	},
	minimalPlayers: {
		type: 'number',
		min: 1,
		default: 3,
	},
	allowLateJoin: {
		type: 'boolean',
		default: false,
	},
	enabledModules: {
		type: 'string',
		options: getModules().map(m => m.name),
		multiple: true,
	},
};

Game.DEFAULT_SETTINGS = {
	mode: 'point', // one of: point, list
	countdownTime: 5, // in seconds
	minimalPlayers: 3,
	allowLateJoin: false, // allow join after game has been started.
	enabledModules: getModules().map(m => m.name),
};

/**
 * @param {Object} [settings]
 * @return {Game}
 */
function generateGame(settings) {
	let id;
	do {
		id = uid().toUpperCase();
	} while(games[id] != null);

	const game = new Game(id, settings);
	games[id] = game;
	game.on('game.finish', () => {
		const mapPlayers = players => {
			return _(players)
				.map(p => `${p.nickname} (${p.points} point(s))`)
				.join(', ');
		};

		const winners = multiMax(game.players, 'points');
		const losers = _.reject(game.players, x => _.some(winners, y => y.id === x.id));

		game.printInfo([
			[ 'Game finished!' ],
			[ 'Winner(s):', mapPlayers(winners) ],
			[ 'Loser(s):', mapPlayers(losers) ],
		]);
	});
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
