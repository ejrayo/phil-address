const babel = require('@rollup/plugin-babel').default;
const resolve = require('@rollup/plugin-node-resolve').default;
const terser = require('@rollup/plugin-terser');

const config = {
  input: 'src/index.js',
  output: [
    {
      file: 'dist/index.js',
      format: 'cjs',
      exports: 'named',
      sourcemap: true
    },
    {
      file: 'dist/index.esm.js',
      format: 'esm',
      sourcemap: true
    },
    {
      file: 'dist/index.min.js',
      format: 'umd',
      name: 'PhilAddress',
      exports: 'named',
      sourcemap: true,
      plugins: [terser()]
    }
  ],
  plugins: [
    resolve(),
    babel({
      babelHelpers: 'bundled',
      exclude: 'node_modules/**',
      presets: [
        ['@babel/preset-env', {
          targets: {
            node: '12',
            browsers: ['last 2 versions', 'ie >= 11']
          }
        }]
      ]
    })
  ],
  external: [] // No external dependencies
};

module.exports = config;