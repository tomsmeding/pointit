import m from 'mithril';
import Question from '../components/question.js';
import { Timer } from '../utils.js';

export default {
	interludeTimer: new Timer(),
	currentQuestion: null,
	questionCb: undefined,

	oninit(vnode) {
		window.Connection.on('game.interlude', (gameId, date) => {
			this.interludeTimer.start(new Date(date));
		});

		window.Connection.on('game.question.next', (gameId, question) => {
			vnode.state.currentQuestion = question;

			this.interludeTimer.stop();

			return new Promise(resolve => {
				vnode.state.questionCb = resolve;
			});
		});
	},

	view(vnode) {
		const timer = vnode.state.interludeTimer;
		const currentQuestion = vnode.state.currentQuestion;

		return m('.game', [
			timer != null ? timer.countdown() : undefined,

			currentQuestion != null ?
				m(Question, {
					question: currentQuestion.question,
					answers: currentQuestion.answers,
					callback: vnode.state.questionCb,
				}) : undefined,
		]);
	},
};
