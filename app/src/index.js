/* global Primus */

import App from './app.js'
import { ArrayMap } from './utils.js'
import m from 'mithril'

const primus = Primus.connect();

window.Connection = {
	id: 0,
	handlers: new ArrayMap(),
	idHandlers: new ArrayMap(),

	send(type, ...args) {
		const id = this.id++;

		const last = args[args.length - 1];
		const callback = typeof last === 'function' && last;
		if (callback != null) {
			this.idHandlers.push(id, callback);
		}

		primus.write({
			id,
			type,
			args,
		});
	},

	on(type, fn) {
		this.handlers.push(type, fn);
	},
};
primus.on('data', function (data) {
	const conn = window.Connection;

	if (conn.id < data.id) {
		conn.id = data.id;
	}

	if (data.type === 'ok' || data.type === 'error') {
		for (const fn of conn.idHandlers.get(data.id)) {
			fn(data);
		}
		conn.idHandlers.remove(data.id);
	} else {
		for (const fn of conn.handlers.get(data.type)) {
			fn(data);
		}
	}

	m.redraw();
});

m.mount(document.body, App);
