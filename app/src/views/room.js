import m from 'mithril'
import NameInput from '../components/nameInput.js'
import Countdown from '../components/countdown.js'

export default {
	timeLeft: null,
	isReady: false,

	oninit(vnode) {
		window.Connection.once('game.countdown.start', () => {
			const intervalId = setInterval(() => {
				vnode.state.timeLeft = window.state.game.timeLeft();
				m.redraw();
			}, 250);

			window.Connection.once('game.start', () => {
				clearInterval(intervalId);
			});
		});
	},

	view(vnode) {
		const timeLeft = vnode.state.timeLeft;

		return m('div', [
			timeLeft != null ?
				m(Countdown, { timeLeft }) :
				undefined,

			m(NameInput),

			m('input[type=checkbox]', {
				onchange: m.withAttr('checked', function (checked) {
					window.Connection.send('ready.set', checked);
					vnode.state.isReady = checked;
				}),
				checked: vnode.state.isReady,
			}),
		]);
	},
}
