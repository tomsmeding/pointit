import m from 'mithril'
import Room from './views/room.js'

export default {
	oninit(vnode) {
		this.roomId = document.location.pathname.slice(1);

		this.state = {
			room: undefined,
			joining: true,
		};

		window.Connection.send('join-room', this.roomId, () => {
			this.state.joining = false;
		});
	},

	view(vnode) {
		return m('div', { className: 'shell' }, [
			this.state.joining ?
				'Joining room...' :
				m(Room, { roomId: this.roomId }),
		]);
	},
}
