import m from 'mithril'

export default {
	view(vnode) {
		return m('div', `Room ID: ${vnode.attrs.roomId}`);
	},
}
