const util = require('./util.js');
const { games } = require('./room.js');

module.exports = function (player) {
	const conn = player.connection;

	return async function (data) {
		if (conn.id < data.id) {
			conn.id = data.id;
		}

		function reply (type, ...args) {
			player.connection.spark.write({
				id: data.id,
				type,
				args,
			});
		}

		function ok (...args) {
			return reply('ok', ...args);
		}
		function error (...args) {
			return reply('error', ...args);
		}

		try {
			switch (data.type) {
			case 'join-room':
				games[data.args[0]].addPlayer(player);
				break;
			}
			await util.sleep(3000); // TODO: REMOVE THIS, emulates a slow network.
			ok();
		} catch (e) {
			console.error(e);
			error(e.message);
		}
	};
}
