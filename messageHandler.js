const { games } = require('./room.js');

module.exports = function (player) {
	return function (data) {
		switch (data.type) {
		case 'join-room':
			games[data.args[0]].addPlayer(player);
			break;
		}
	};
}
