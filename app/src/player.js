export default class Player {
	constructor(id) {
		this.id = id;
		this.nickname = '';
		this.ready = false;

		const createEventBinding = (event, field) => {
			window.Connection.on(event, (gameId, playerId, val) => {
				if (this.id === playerId) {
					this[field] = val;
				}
			});
		};
		createEventBinding('player.ready', 'ready');
		createEventBinding('nick.set', 'nickname');
	}

	static parse(raw) {
		const player = new Player(raw.id);
		player.nickname = raw.nickname;
		player.ready = raw.ready;
		return player;
	}
}
