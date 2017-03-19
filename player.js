const { uid } = require('./util.js');
const _ = require('lodash');

class Player {
	constructor(connection) {
		this.id = uid(10);
		this.connection = connection;
		this.nickname = '';
	}

	send(...args) {
		return this.connection.send(...args);
	}

	toJSON() {
		const fields = [
			'id',
			'nickname',
		];
		return _.pick(this, fields);
	}
}

module.exports = Player;
