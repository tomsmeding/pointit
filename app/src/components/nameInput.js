import m from 'mithril';

export default {
	changeName(val) {
		window.Connection.send('nick.set', val);
		window.state.nickname = val;
		window.state.self.nickname = val;
	},

	view() {
		return m('input[type="text"]', {
			value: window.state.nickname,
			oninput: m.withAttr('value', this.changeName),
		});
	},
};
