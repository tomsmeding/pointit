import m from 'mithril'
import RoomView from './views/room.js'
import GameView from './views/game.js'
import Header from './components/header.js'
import Game from './game.js'
import Loading from './components/loading.js'
import Player from './player.js'
import FullscreenMessage from './components/fullscreenMessage.js'

export default {
	loading: true,
	error: null,

	oninit(vnode) {
		const roomId = document.location.pathname.slice(1);

		window.Connection.send('hello', 'new', (e, p) => {
			if (e != null) {
				console.error(e);
			} else {
				const player = Player.parse(p);
				window.state.self = player;
				window.state.nickname = player.nickname;

				window.Connection.send('room.join', roomId, (error, res) => {
					vnode.state.loading = false;

					if (error != null) {
						vnode.state.error = error;
					} else {
						window.state.game = Game.parse(window.Connection, res);
					}
				});
			}
		});
	},

	view(vnode) {
		const game = window.state.game;

		if (vnode.state.loading) {
			return m('#app', m(Loading));
		} else if (vnode.state.error != null) {
			const message = m(FullscreenMessage, {
				type: 'error',
			}, ({
				'game-started': 'Game has already been started!',
			})[vnode.state.error]);

			return m('#app', message);
		}

		return m('#app', [
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
		]);
	},
}
