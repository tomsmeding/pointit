export default class Player {
	constructor(id) {
		this.id = id;
		this.nickname = '';
		this.ready = false;

		window.Connection.on('nick.set', (gameId, playerId, nickname) => {
			if (this.id === playerId) {
				console.log('hit');
				this.nickname = nickname;
			}
		});
	}

	static parse(raw) {
		const player = new Player(raw.id);
		player.nickname = raw.nickname;
		player.ready = raw.ready;
		return player;
	}
}
