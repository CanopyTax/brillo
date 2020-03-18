import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';

export default {
  input: 'src/brillo.js',
  output: {
    file: 'build/brillo.js',
    format: 'cjs'
  },
  external: ['electron'],
  plugins: [resolve(), commonjs(), terser({
    output: {
      comments: false,
    },
  })],
};