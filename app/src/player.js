export default class Player {
	constructor(id) {
		this.id = id;
		this.nickname = '';
		this.ready = false;

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
	}

	static parse(raw) {
		const player = new Player(raw.id);
		player.nickname = raw.nickname;
		player.ready = raw.ready;
		player.privateKey = raw.privateKey;
		return player;
	}
}
