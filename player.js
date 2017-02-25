const { uid } = require('./util.js');

class Player {
	constructor(connection) {
		this.id = uid(10);
		this.connection = connection;
	}

	async send(...args) {
		return await this.connection.send(...args);
	}
}

module.exports = Player;
