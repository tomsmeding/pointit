const _ = require('lodash');
const EventEmitter = require('events');
const { getModule, getModules } = require('./module.js');
const { uid, sendAndWaitAll, sleep } = require('./util.js');

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

		for (let i = 0; i < this.modules.length; i++) {
			const module = this.modules[i];

			let callbackGiven = false;
			const getCallback = () => {
				console.log('getCallback called');
				callbackGiven = true;
				return () => {
					console.log('callback called');
					console.error('TODOOOOO');
				};
			};

			const instance = new module.module(this, getCallback);

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
				targetDate.setSeconds(targetDate.getSeconds() + 3);

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
					const promises = this.activePlayers().map(p => {
						const res = instance.checkAnswer({
							player: p,
						});
						return Promise.resolve(res).then(res => [ p, res ]);
					});
					const pairs = await Promise.all(promises);
					for (const [ player, answerCorrect ] of pairs) {
						// TODO: actually wait on clients here
						player.connection.send('answer.correct', this.id, answerCorrect);
					}
				}

				this.emit('question.done', {
					index: instance.current,
				}, {
					module: instance,
					index: i,
					length: this.modules.length,
				});
			} while(instance.next());

			this.emit('finish');
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
			player.send(type, this.id, ...args);
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
