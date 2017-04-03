import m from 'mithril'
import _ from 'lodash';

export default {
	view(vnode) {
		return m('div', [
			m('.question', vnode.attrs.question),
			vnode.attrs.answers.map(a => {
				return m('button', {
					onclick: _.partial(vnode.attrs.callback, a),
				}, a.text);
			}),
		]);
	},
}
