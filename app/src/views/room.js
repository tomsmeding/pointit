import m from 'mithril'
import NameInput from '../components/nameInput.js'
import Countdown from '../components/countdown.js'
import List from '../components/list.js'

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
		let intervalId;

		window.Connection.on('game.countdown.start', () => {
			intervalId = setInterval(() => {
				vnode.state.timeLeft = window.state.game.timeLeft();
				m.redraw();
			}, 250);
		});

		window.Connection.on('game.countdown.stop', () => {
			clearInterval(intervalId);
			vnode.state.timeLeft = null;
		});

		window.Connection.on('game.start', () => {
			clearInterval(intervalId);
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

		return m('#room', [
			timeLeft != null ?
				m(Countdown, {
					timeLeft,
					onclick: () => this.setReady(false),
				}) : undefined,

			m('#selfInfo', [
				m(NameInput),
				m('input[type=checkbox]', {
					onchange: m.withAttr('checked', this.setReady),
					checked: self.ready,
				}),
			]),

			m(List, {
				class: 'playerList',
				header: 'Players',
				noItemsMessage: 'You\'re the only one in the room! :(',
			}, game.players.filter(p => {
				return !p.disconnected && !p.equals(window.state.self);
			}).map(player => {
				return m(PlayerRow, { player });
			})),
		]);
	},
}
