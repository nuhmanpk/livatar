import { defineConfig } from 'tsup'

export default defineConfig([
  {
    entry: {
      index: 'src/index.ts',
      element: 'src/element.ts',
      react: 'src/react.ts',
      vue: 'src/vue.ts',
      action: 'src/action.ts',
      icons: 'src/icons.ts',
      server: 'src/server.ts',
    },
    format: ['esm', 'cjs'],
    dts: true,
    minify: true,
    treeshake: true,
    splitting: true,
    external: ['react', 'vue'],
    target: 'es2019',
  },
  {
    entry: { livatar: 'src/global.ts' },
    format: ['iife'],
    globalName: 'Livatar',
    minify: true,
    target: 'es2019',
  },
])
