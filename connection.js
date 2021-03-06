const { uid } = require('./util.js');

class Connection {
	constructor(spark) {
		this.spark = spark;
		this._resultHandlers = new Map();
	}

	get id() {
		return this.spark.mirage;
	}

	on(type, fn) {
		return this.spark.on(type, fn);
	}

	_write(msg) {
		this.spark.write(msg);
		return new Promise((resolve, reject) => {
			this._resultHandlers.set(msg.id, (err, res) => {
				if (err != null) {
					reject(err);
				} else {
					resolve(res);
				}
			});
		});
	}

	send(type, ...args) {
		return this._write({
			id: uid(25),
			type,
			args,
		});
	}

	reply(id, type, ...args) {
		return this.spark.write({
			id,
			type,
			args,
		});
	}
}

module.exports = Connection;
