export class ArrayMap {
	constructor() {
		this._map = new Map();
	}

	push(key, val) {
		if (this._map.has(key)) {
			this._map.get(key).push(val);
		} else {
			this._map.set(key, [ val ]);
		}
	}

	get(key) {
		return this._map.get(key) || [];
	}

	remove(key) {
		return this._map.delete(key);
	}
}
