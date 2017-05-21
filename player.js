const { uid } = require('./util.js');
const { games } = require('./room.js');
const _ = require('lodash');

class Player {
	constructor(connection) {
		this.id = uid(10);
		this.connection = connection;
		this.nickname = `Player_${uid(4)}`;
		this.disconnected = false;
	}


	setDisconnected(val) {
		this.disconnected = val;
		_.chain(games)
			.values()
			.filter(g => g.players.some(p => p.id === this.id))
			.value()
			.forEach(g => g.broadcast('player.disconnected', this.id, val));
	}

	toJSON() {
		const fields = [
			'id',
			'nickname',
			'disconnected',
		];
		return _.pick(this, fields);
	}
}

module.exports = Player;
