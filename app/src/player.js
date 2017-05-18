export default class Player {
	constructor(id, nickname) {
		this.id = id;
		this.nickname = nickname;

		this.ready = false;
		this.disconnected = false;

		const createEventBinding = (event, field) => {
			window.Connection.on(event, (gameId, playerId, val) => {
				if (this.id === playerId) {
					this[field] = val;
				}
			});
		};
		createEventBinding('player.ready', 'ready');
		createEventBinding('player.nick', 'nickname');
		createEventBinding('player.disconnected', 'disconnected');
	}

	equals(player) {
		return this.id === player.id;
	}

	static parse(raw) {
		const player = new Player(raw.id, raw.nickname);
		player.ready = raw.ready;
		player.disconnected = raw.disconnected;

		return player;
	}
}
