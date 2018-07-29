import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';

export default {
	input: 'src/client.js',
	output: {
		format: 'iife',
		sourcemap: true,
	},

	plugins: [
		commonjs(),

		nodeResolve({
			jsnext: true,
			main: true,
			browser: true,
		}),

		babel(),
	],
};
