import m from 'mithril';
import _ from 'lodash';

export default {
	view(vnode) {
		return m('#questionScreen', [
			m('#question', vnode.attrs.question),
			m('#answers', vnode.attrs.answers.map(a => {
				return m('button', {
					onclick: _.partial(vnode.attrs.callback, a.id),
				}, a.text);
			})),
		]);
	},
}
