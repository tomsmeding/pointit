/* global Primus */

import m from 'mithril'
import App from './app.js'
import { ArrayMap } from './utils.js'

const primus = Primus.connect();

// TODO
window.state = {
	nickname: '',
	self: null,
	game: null,
};

window.Connection = {
	id: -1,
	handlers: new ArrayMap(),
	onceHandlers: new ArrayMap(),
	idHandlers: new ArrayMap(),

	reply(id, ...args) {
		primus.write({
			id,
			type: 'res',
			args,
		});
	},

	send(type, ...args) {
		const id = ++this.id;

		const last = args[args.length - 1];
		const callback = typeof last === 'function' && last;
		if (callback) {
			this.idHandlers.push(id, callback);
			args.pop();
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

	once(type, fn) {
		this.onceHandlers.push(type, fn);
	},
};
primus.on('data', function (data) {
	const conn = window.Connection;

	if (conn.id < data.id) {
		conn.id = data.id;
	}

	if (data.type === 'res') {
		for (const fn of conn.idHandlers.get(data.id)) {
			fn(...data.args);
		}
		conn.idHandlers.remove(data.id);
	} else {
		let error;
		let promise;

		try {
			const handlers = conn.handlers.get(data.type)
				.concat(conn.onceHandlers.get(data.type));

			for (const fn of handlers) {
				const res = fn(...data.args);
				if (res !== undefined) {
					if (promise === undefined) {
						promise = res;
					} else {
						console.warn('promise already retrievied', promise, 'but got a new one', res);
					}
				}
			}
		} catch (e) {
			console.error(e);
			error = e.toString();
		}

		Promise.resolve(promise).then(
			res => [ null, res ],
			err => [ err, null ]
		).then(([ err, res ]) => {
			err = err || error;
			conn.reply(data.id, err, res);
		});

		conn.onceHandlers.remove(data.type);
	}

	m.redraw();
});

m.mount(document.body, App);
