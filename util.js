const crypto = require('crypto');

const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
function uid (length = 6) {
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

module.exports = {
	uid,
	uniqid,
};
