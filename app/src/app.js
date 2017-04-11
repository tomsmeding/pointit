import _ from 'lodash';
import m from 'mithril';
import RoomView from './views/room.js';
import GameView from './views/game.js';
import Header from './components/header.js';
import Game from './game.js';
import Loading from './components/loading.js';
import Player from './player.js';
import FullscreenMessage from './components/fullscreenMessage.js';

export default {
	loading: true,
	error: null,

	oninit(vnode) {
		const roomId = _.last(document.location.pathname.split('/'));

		const handshake = cb => {
			window.Connection.send('hello', (e, p) => {
				if (e != null) {
					cb(e);
				} else {
					const player = Player.parse(p);
					window.state.self = player;
					window.state.nickname = player.nickname;
					cb(null);
				}
			});
		}

		const join = cb => {
			window.Connection.send('room.join', roomId, (error, res) => {
				vnode.state.loading = false;

				if (error != null) {
					vnode.state.error = error;
					cb(error);
				} else {
					window.state.game = Game.parse(window.Connection, res);
					cb(null);
				}
			});
		}

		window.Connection.primus.on('reconnected', handshake);
		handshake(e => {
			if (e == null) {
				join(_.noop);
			}
		});
	},

	view(vnode) {
		const game = window.state.game;

		const children = (function () {
			if (vnode.state.loading) {
				return m('#app', m(Loading));
			} else if (vnode.state.error != null) {
				return m(FullscreenMessage, {
					type: 'error',
				}, ({
					'game-started': 'Game has already been started',
					'room-not-found': 'No game with the given ID found',
				})[vnode.state.error]);
			} else {
				return [
					!window.Connection.online && m('div', 'disconnected!'),

					m(Header, { game }),

					m('#content', [
						game.started ?
							m(GameView, {
								game,
							}) :
							m(RoomView, {
								room: game,
							}),
					]),
				]
			}
		})();

		return m('#app', children);
	},
}
