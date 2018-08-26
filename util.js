const crypto = require('crypto');
const _ = require('lodash');

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

// execute `fn` on all the given `items`, stop executing after `timeout`, all
// the items will be returned with as: `{ data, resolved, res, err }`.
async function sendAndWaitAll (items, fn, timeout) {
	items = items.map(data => ({
		data,
		resolved: false,
		res: null,
		err: null,
	}));
	const race = [];

	const promises = items.map(item =>
		fn(item.data)
			.then(res => {
				item.resolved = true;
				item.res = res;
			})
			.catch(err => {
				item.resolved = true;
				item.err = err;
			})
	);
	race.push(Promise.all(promises));

	if (timeout !== Infinity) {
		const timeoutPromise =
			sleep(timeout).then(() => {
				throw new Error('timeout');
			});

		race.push(timeoutPromise);
	}

	try {
		await Promise.race(race);
		return items;
	} catch (err) {
		return items;
	}
}

// returns all the objects in `arr` where `obj[field]` equals the maximum valeu
// in `arr`.
function multiMax (arr, field) {
	const maxValue = _.maxBy(arr, field)[field];
	return _.filter(arr, x => x[field] === maxValue);
}

module.exports = {
	uid,
	uniqid,
	sleep,
	sendAndWaitAll,
	multiMax,
};
