const _ = require('lodash');
const { getGame } = require('./room.js');
const { sleep } = require('./util.js');

module.exports = function (player, game) {
	const conn = player.connection;

	return async function (data) {
		function res (e, r) {
			conn.reply(data.id, 'res', e, r);
		}

		switch (data.type) {
		case 'res':
			conn._resultHandlers.get(data.id)(...data.args);
			conn._resultHandlers.delete(data.id);
			break;

		case 'timesync': {
			const obj = data.args[0];
			conn.send('timesync', {
				id: _.get(obj, 'id', null),
				result: _.now(),
			});
			break;
		}

		case 'room.get':
			res(null, game);
			break;
		case 'room.join':
			game = getGame(data.args[0]);
			if (game == null) {
				res('room-not-found', null);
				return;
			} else if (game.started && !game.settings.allowLateJoin) {
				res('game-started', null);
				game = null;
				return;
			}

			game.addPlayer(player);

			res(null, game);
			break;
		case 'room.leave':
			try {
				game.removePlayer(player);
				game = null;
				res(null);
			} catch (e) {
				res('not-in-room', null);
			}
			break;

		case 'nick.get':
			res(null, player.nickname);
			break;
		case 'nick.set': {
			const prev = player.nickname;
			let next = data.args[0];

			if (prev === next) {
				res(null, next);
				return;
			}

			const reg = new RegExp(`^${_.escapeRegExp(next)}(\\(\\d\\))?$`);
			const num = _.chain(game.players)
				.map(p => reg.exec(p.nickname))
				.compact()
				.map(match =>
					match[1] ?
						Number.parseInt(match[1].replace(/\W/g, ''), 10) :
						0
				)
				.max()
				.value();
			if (num != null) {
				next += `(${num + 1})`;
			}

			player.nickname = next;
			game.broadcast('player.nick', player.id, player.nickname);
			res(null, next);
			break;
		}

		case 'ready.set':
			player.ready = data.args[0];
			game.broadcast('player.ready', player.id, player.ready);
			res(null);

			if (
				game.countdownTimeoutId != null &&
				!game.started &&
				!player.ready
			) {
				clearTimeout(game.countdownTimeoutId);
				game.countdownTimeoutId = undefined;
				game.broadcast('game.countdown.stop');
				break;
			}

			if (
				game.countdownTimeoutId == null &&
				!game.started &&
				game.activePlayers().length >= game.settings.minimalPlayers &&
				game.activePlayers().every(p => p.ready)
			) {
				const countdownTime = game.settings.countdownTime;

				const startDate = new Date();
				startDate.setSeconds(startDate.getSeconds() + countdownTime);

				try {
					await game.broadcastAndWait(
						(countdownTime-1) * 1000,
						'game.countdown.start',
						startDate.getTime()
					);
					game.countdownTimeoutId = setTimeout(function () {
						game.start().catch(err => {
							// REVIEW: what the fuck do we do now?
							console.error('=====GLOBAL GAME ERROR=====\n', err);
						});
					}, countdownTime * 1000);
				} catch (e) {
					// TODO: one or more clients didn't reply, handle this,
					// someone probably lost their connection or their device is
					// super slow...
				}
			}

			break;

		default:
			res('unknown-command');
			break;
		}
	};
}
