import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import path from 'node:path'
import plugin from 'rollup-plugin-import-data-uri'


export default defineConfig({
  plugins: [svelte(), plugin() as any],
  resolve: {
    alias: {
      $lib: path.resolve('./src/lib'),
    },
  },
})
