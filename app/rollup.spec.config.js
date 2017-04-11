import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';

export default {
	entry: 'src/spec.js',
	plugins: [
		nodeResolve({
			jsnext: true,
			main: true,
			browser: true,
		}),

		commonjs(),

		babel(),
	],

	format: 'iife',

	sourceMap: true,
};
