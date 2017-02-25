const util = require('./util.js');
const { games } = require('./room.js');

module.exports = function (player) {
	const conn = player.connection;

	return async function (data) {
		if (conn.id < data.id) {
			conn.id = data.id;
		}

		async function reply (type, ...args) {
			await player.connection.spark.write({
				id: data.id,
				type,
				args,
			});
		}

		async function ok (...args) {
			return await reply('ok', ...args);
		}
		async function error (...args) {
			return await reply('error', ...args);
		}

		try {
			switch (data.type) {
			case 'join-room':
				await games[data.args[0]].addPlayer(player);
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
