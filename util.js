const crypto = require('crypto');

const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
function uid (length = 5) {
	const bytes = crypto.randomBytes(length)

	let res = ''
	for (let i = 0; i < bytes.length; i++) {
		res += chars[bytes[i] % chars.length]
	}
	return res
}

var uniqid = (function () {
	let id = 0;
	return function () {
		return id++;
	};
})()

async function sleep (ms) {
	await new Promise(resolve => {
		setTimeout(function () {
			resolve();
		}, ms);
	});
}

async function sendAndWaitAll (connections, type, args, timeout) {
	const result = connections.map(c => ({
		connection: c,
		answered: false,
		err: null,
		res: null,
	}));

	const promises = [
		Promise.all(connections.map(c => {
			const item = result.find(r => r.connection === c);
			return c.send(type, ...args).then(res => {
				item.answered = true;
				item.res = res;
			}, err => {
				item.answered = true;
				item.err = err;
			});
		})),
	];

	if (timeout !== Infinity) {
		promises.push(
			sleep(timeout).then(() => {
				throw new Error('timeout');
			})
		);
	}

	try {
		await Promise.race(promises);
		return result;
	} catch(err) {
		throw result;
	}
}

module.exports = {
	uid,
	uniqid,
	sleep,
	sendAndWaitAll,
};
