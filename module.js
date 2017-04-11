const _ = require('lodash');
const fs = require('fs');
const path = require('path');

class Module {
	constructor(game) {
		this.game = game;
		this.answers = [];
		this.current = 0;
	}

	// REVIEW: do we want another way all around???
	// REVIEW: put this somewhere else?
	// util func
	_players(player) {
		let players = this.game.activePlayers();

		if (player != null) {
			players = players.filter(p => p.id !== player.id);
		}

		return players.map(p => ({
			id: p.id,
			text: p.nickname,
		}));
	}

	provideAnswer({ player, answerId }) {
		this.answers.push({
			player,
			answerId,
		});
	}

	getAnswer(player) {
		const answer = this.answers.find(a => a.player.id === player.id);
		if (answer != null) {
			return answer.answerId;
		}
	}

	next() {
		// should be overwritten when a module wants to provide multiple
		// questions.
		return false;
	}
}

const modules = new Map();

function getModule(name) {
	return modules.get(name);
}

function getModules() {
	return _.toArray(modules.values());
}

module.exports = {
	getModule,
	getModules,
	Module,
};

function modulePath(file = '') {
	return path.join(__dirname, '/modules/', file);
}

const files = fs.readdirSync(modulePath()).filter(f => f.endsWith('.js'));
console.log('found', files.length, 'modules');
for (const file of files) {
	const module = require(modulePath(file));
	console.log(`loaded ${file} (${module.name})`);
	modules.set(module.name, module);
}

/*
function addModule(name, obj) {
	if (modules.has(name)) {
		throw new Error(`There already exists a module with the name '${name}'`);
	}

	const orig = obj.prototype.next;
	obj.prototype.orig = function () {
		const res = orig.apply(this, arguments);
		res.answers = _.take(res.answers, MAX_ANSWERS);
		return res;
	};

	modules.set(name, obj);
}
*/
