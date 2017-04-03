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
	const promises = [
		Promise.all(connections.map(c => c.send(type, ...args))),
	];

	if (timeout !== Infinity) {
		promises.push(
			sleep(timeout).then(() => {
				throw new Error('timeout');
			})
		);
	}

	await Promise.race(promises);
}

module.exports = {
	uid,
	uniqid,
	sleep,
	sendAndWaitAll,
};
