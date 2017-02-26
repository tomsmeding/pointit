/* global Primus */

import App from './app.js'
import m from 'mithril'

const primus = Primus.connect();

window.Connection = {
	id: 0,
	handlers: {},
	idHandlers: {},

	send(type, ...args) {
		const id = this.id++;

		const last = args[args.length - 1];
		const callback = typeof last === 'function' && last;
		if (callback != null) {
			this.idHandlers[id] = this.idHandlers[id] || [];
			this.idHandlers[id].push(callback);
		}

		primus.write({
			id,
			type,
			args,
		});
	},

	on(type, fn) {
		this.handlers[type] = this.handlers[type] || [];
		this.handlers[type].push(fn);
	},
};
primus.on('data', function (data) {
	const conn = window.Connection;

	if (conn.id < data.id) {
		conn.id = data.id;
	}

	if (data.type === 'ok' || data.type === 'error') {
		const handler = conn.idHandlers[data.id];
		for (const fn of handler) {
			fn(data);
		}
		delete conn.idHandlers[data.id];
	} else {
		for (const fn of conn.handlers[data.type]) {
			fn(data);
		}
	}

	m.redraw();
});

m.mount(document.body, App);
