import fs from 'fs';
import path from 'path';
import url from 'url';
import glob from 'glob';
import typescript from '@rollup/plugin-typescript';
import nodeResolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { getBabelOutputPlugin } from '@rollup/plugin-babel';
import replace from '@rollup/plugin-replace';
import { terser } from 'rollup-plugin-terser';

const dirname = path.dirname(url.fileURLToPath(import.meta.url));
const pkgJson = JSON.parse(
  fs.readFileSync(path.join(dirname, 'package.json'), 'utf8'),
);

const nodeResolveOpts = {
  browser: true,
  preferBuiltins: true,
};

const replaceOpts = {
  preventAssignment: true,
  'process.env.NODE_ENV': JSON.stringify('production'),
  'process.env.HIBP_UA': JSON.stringify(`${pkgJson.name} ${pkgJson.version}`),
};

const typescriptOpts = {
  exclude: ['**/*.d.ts'],
  declaration: false,
};

const terserOpts = {
  compress: {
    pure_getters: true,
    unsafe: true,
    unsafe_comps: true,
  },
};

export default [
  // ESM for Bundlers
  {
    input: glob.sync('src/**/*.ts', {
      ignore: [
        '**/__mocks__/**',
        '**/__tests__/**',
        '**/mocks/**',
        '**/*.test.ts',
        '**/*.d.ts',
      ],
    }),
    output: {
      dir: 'dist',
      entryFileNames: '[name].js',
      format: 'esm',
      sourcemap: true,
      indent: false,
      preserveModules: true,
      preserveModulesRoot: 'src',
    },
    external: (id) => !/^(\.|\/|[a-z]:\\)/i.test(id),
    plugins: [
      replace(replaceOpts),
      typescript(typescriptOpts),
      getBabelOutputPlugin({
        plugins: ['babel-plugin-annotate-pure-calls'],
        presets: [['@babel/env', { targets: { node: '12.20.0' } }]],
      }),
    ],
  },

  // ESM for Browsers
  {
    input: 'src/hibp.ts',
    output: {
      file: 'dist/hibp.bundled.js',
      format: 'esm',
      sourcemap: true,
      indent: false,
    },
    plugins: [
      nodeResolve(nodeResolveOpts),
      commonjs(), // currently still needed for isomorphic-unfetch
      replace(replaceOpts),
      typescript(typescriptOpts),
      getBabelOutputPlugin({
        presets: [
          ['@babel/env', { modules: false, targets: { esmodules: true } }],
        ],
      }),
      terser(terserOpts),
    ],
  },
];
