import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default {
  input: 'src/brillo.js',
  output: [
    {
      name: 'Brillo',
      file: 'build/brillo.umd.js',
      format: 'umd'
    },
    {
      file: 'build/brillo.cjs.js',
      format: 'cjs'
    },
    {
      file: 'build/brillo.esm.js',
      format: 'esm'
    }
  ],
  external: ['electron'],
  plugins: [resolve(), commonjs()],
};
