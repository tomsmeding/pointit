export default class Player {
	constructor(id) {
		this.id = id;
		this.nickname = '';
		this.ready = false;
		this.disconnected = false;

		this.privateKey = undefined;

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
		const player = new Player(raw.id);
		player.nickname = raw.nickname;
		player.ready = raw.ready;
		player.disconnected = raw.disconnected;

		player.privateKey = raw.privateKey;

		return player;
	}
}
