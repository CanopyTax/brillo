import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default {
  output: {
    format: 'cjs'
  },
  external: ['electron', 'rxjs'],
  plugins: [resolve(), commonjs()],
};