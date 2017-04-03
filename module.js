const _ = require('lodash');
const fs = require('fs');
const path = require('path');

class Module {
	constructor(game) {
		this.game = game;
		this.answers = [];
	}

	provideAnswer({ player, answerIndex }) {
		this.answers.push({
			player,
			answerIndex,
		});
		console.log(this.answers); // TODO: REMOVE
	}

	getAnswer(player) {
		this.answers.find(a => a.player.id === player.id);
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
