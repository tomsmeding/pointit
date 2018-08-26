import m from 'mithril'

export default {
	view(vnode) {
		const game = vnode.attrs.game;

		return m(
			'div',
			{ id: 'header' },
			game != null ? [ m('span', { id: 'gameId' }, game.id) ] : [],
		);
	},
}
