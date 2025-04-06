import resolve from '@rollup/plugin-node-resolve';
import json    from '@rollup/plugin-json';

export default {
  input: 'src/index.js',
  output: [
    {
      file: 'dist/phil-address.umd.js',
      format: 'umd',
      name: 'PhilAddress'
    },
    {
      file: 'dist/phil-address.esm.js',
      format: 'es'
    }
  ],
  plugins: [json(),resolve()]
};
