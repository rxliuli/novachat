import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts', 'src/internal.ts'],
  format: ['esm'],
  bundle: true,
  splitting: false,
  dts: true,
  platform: 'browser',
  esbuildOptions: (options) => {
    options.platform = 'browser'
  },
})
