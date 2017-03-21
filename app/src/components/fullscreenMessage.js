import m from 'mithril';

export default {
	view(vnode) {
		const type = vnode.attrs.type || 'default';
		const button = vnode.attrs.button;

		return m(`div.fullscreenNotice.${type}`, [
			m('div', vnode.children),
			button == null ? undefined : m('button', {
				class: button.class,
				onclick: button.onclick,
			}, button.text),
		]);
	},
};
