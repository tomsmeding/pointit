var uniqid = (function () {
	let id = 0;
	return function () {
		return id++;
	};
})()

module.exports = {
	uniqid,
};
