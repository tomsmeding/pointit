import m from 'mithril'
import RoomView from './views/room.js'
import GameView from './views/game.js'
import Header from './components/header.js'
import Game from './game.js'
import Loading from './components/loading.js'

export default {
	loading: true,

	oninit(vnode) {
		const roomId = document.location.pathname.slice(1);

		window.Connection.send('room.join', roomId, (error, res) => {
			if (error != null) {
				console.error(error);
			} else {
				vnode.state.loading = false;
				window.state.game = Game.parse(window.Connection, res);
			}
		});
	},

	view(vnode) {
		const game = window.state.game;

		return m('div#app', [
			m(Header, { game }),

			vnode.state.loading ?
				m(Loading) :
				m('div#content', [
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
