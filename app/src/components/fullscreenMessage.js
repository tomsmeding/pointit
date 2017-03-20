import m from 'mithril';

export default {
	view(vnode) {
		const type = vnode.attrs.type || 'default';
		return m(`div.fullscreenNotice.${type}`, vnode.children);
	},
};
