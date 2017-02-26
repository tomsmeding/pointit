class Connection {
	constructor(spark) {
		this.currentId = 0;
		this.spark = spark;
	}

	on(type, fn) {
		return this.spark.on(type, fn);
	}

	send(type, ...args) {
		this.spark.write({
			id: ++this.currentId,
			type,
			args,
		});
	}
}

module.exports = Connection;
