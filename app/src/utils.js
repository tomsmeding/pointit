import m from 'mithril';
import Countdown from './components/countdown.js';

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

export class Timer {
	constructor(endDate) {
		if (endDate != null) {
			this.start(endDate);
		}
	}

	start(endDate) {
		this.endDate = endDate;
	}

	stop() {
		this.endDate = undefined;

		clearInterval(this.intervalId);
		this.intervalId = undefined;
	}

	diff() {
		if (!this.intervalId) {
			this.intervalId = setInterval(() => m.redraw(), 500);
		}

		return this.endDate - new Date();
	}

	countdown(options = {}) {
		if (this.endDate != null) {
			return m(Countdown, {
				...options,
				timeLeft: this.diff(),
			});
		}
	}
}
