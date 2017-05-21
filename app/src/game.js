import _ from 'lodash'
import Player from './player.js'

export default class Game {
	constructor(connection, id) {
		this.id = id;
		this.players = [];

		this.startDate = null;
		this.started = false;
		this.finished = false;

		connection.on('game.countdown.start', (gameId, time) => {
			this.startDate = new Date(time);
		});
		connection.once('game.start', () => {
			this.started = true;
			this.startDate = new Date(); // just to be nice
		});

		connection.on('game.join', (gameId, player) => {
			player = Player.parse(player);
			this.addPlayer(player);
		});

		connection.on('game.leave', (gameId, playerId) => {
			const player = this.players.find(p => p.id === playerId);
			if (player != null) {
				this.removePlayer(player);
			}
		});

		connection.once('game.finish', (gameId, players) => {
			this.finished = true;
			for (const info of players) {
				const player = this.players.find(p => p.id === info.id);
				player.points = info.points;
			}
		});
	}

	timeLeft() {
		return this.startDate == null ?
			null :
			this.startDate - new Date();
	}

	addPlayer(player) {
		this.players.push(player);
	}

	removePlayer(player) {
		_.pull(this.players, player);
	}

	static parse(connection, raw) {
		const game = new Game(connection, raw.id);

		game.players = raw.players.map(p => Player.parse(p));

		game.started = raw.started;
		game.startDate = raw.startDate;

		return game;
	}
}
