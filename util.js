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

async function sendAndWaitAll (items, fn, timeout) {
	const result = items.map(x => ({
		item: x,
		resolved: false,
		res: null,
		err: null,
	}));

	const promises = [
		Promise.all(result.map(obj => {
			return fn(obj.item).then(res => {
				obj.answered = true;
				obj.res = res;
			}, err => {
				obj.answered = true;
				obj.err = err;
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
