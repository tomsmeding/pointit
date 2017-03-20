import m from 'mithril'

export default {
	view(vnode) {
		const game = vnode.attrs.game;
		const children = [];

		if (game != null) {
			children.push(m('span', { id: 'gameId' }, game.id));
		}

		return m('div', { id: 'header' }, children);
	},
}
