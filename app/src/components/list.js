import _ from 'lodash';
import m from 'mithril';

export default {
	view(vnode) {
		const classes = _.compact([ 'list', vnode.attrs.class ]);
		return m('div', {
			class: classes.join(' '),
		}, [
			m('header', vnode.attrs.header),
			m('.items', vnode.children.length === 0 ?
				m('.notice', vnode.attrs.noItemsMessage) :
				vnode.children),
		]);
	},
}
