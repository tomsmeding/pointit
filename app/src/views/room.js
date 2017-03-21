import m from 'mithril'
import NameInput from '../components/nameInput.js'
import Countdown from '../components/countdown.js'

// TODO
const PlayerRow = {
	view(vnode) {
		const player = vnode.attrs.player;
		return m('div', `${player.nickname}---${player.ready ? 'ready' : 'unready'}`);
	},
};

export default {
	timeLeft: null,

	oninit(vnode) {
		window.Connection.once('game.countdown.start', () => {
			const intervalId = setInterval(() => {
				vnode.state.timeLeft = window.state.game.timeLeft();
				m.redraw();
			}, 250);

			window.Connection.once('game.countdown.stop', () => {
				clearInterval(intervalId);
				vnode.state.timeLeft = null;
			});

			window.Connection.once('game.start', () => {
				clearInterval(intervalId);
			});
		});
	},

	setReady(checked) {
		window.Connection.send('ready.set', checked);
		self.ready = checked;
	},

	view(vnode) {
		const timeLeft = vnode.state.timeLeft;
		const game = window.state.game;
		const self = window.state.self;

		return m('div', [
			timeLeft != null ?
				m(Countdown, {
					timeLeft,
					onclick: () => this.setReady(false),
				}) : undefined,

			m(NameInput),

			m('input[type=checkbox]', {
				onchange: m.withAttr('checked', this.setReady),
				checked: self.ready,
			}),

			m('.playerList', game.players.map(player => {
				return m(PlayerRow, { player });
			})),
		]);
	},
}
