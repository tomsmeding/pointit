import m from 'mithril'
import FullscreenMessage from './fullscreenMessage.js'

export default {
	view(vnode) {
		const timeLeft = vnode.attrs.timeLeft / 1000;
		const text = (function () {
			if (timeLeft > 0) {
				return Math.ceil(timeLeft);
			}

			// waiting on server...
			if (timeLeft > -2) {
				return 0;
			} else {
				return 'Every second now...';
			}
		})();

		return m(FullscreenMessage, {
			type: 'countdown',
			button: vnode.attrs.onclick != null ? {
				text: 'Cancel',
				onclick: vnode.attrs.onclick,
				class: 'button-danger',
			} : undefined,
		}, text);
	},
}
