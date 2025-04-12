import resolve from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';
import replace from '@rollup/plugin-replace';

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
  plugins: [
    replace({
      // The feature flag is defined as false in production
      __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: JSON.stringify(false),
      preventAssignment: true
    }),
    json(),
    resolve()
  ]
};
