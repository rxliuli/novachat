/// <reference types="vitest/config" />
import { defineConfig, Plugin } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import path from 'node:path'
import plugin from 'rollup-plugin-import-data-uri'
import { build as buildForESBuild } from 'esbuild'

function script(): Plugin {
  let env: Record<string, string> = {}
  return {
    name: 'script',
    configResolved(config) {
      env = config.env
    },
    async transform(_code, id) {
      let readId: string = '',
        external: string[] = []
      if (id.endsWith('?script')) {
        readId = id.slice(0, -7)
      } else if (id.endsWith('?plugin')) {
        readId = id.slice(0, -7)
        external = ['@novachat/plugin']
      }
      if (!readId) {
        return
      }
      const realId = id.slice(0, -'?script'.length)
      const result = await buildForESBuild({
        write: false,
        bundle: true,
        minify: false,
        sourcemap: true,
        format: 'esm',
        target: 'esnext',
        platform: 'browser',
        entryPoints: [realId],
        define: {
          ...Object.entries(env)
            .filter(([k]) => k.startsWith('VITE_'))
            .reduce(
              (acc, [k, v]) => ({
                ...acc,
                [`import.meta.env.${k}`]: JSON.stringify(v),
              }),
              {},
            ),
        },
        external,
      })
      const code = result.outputFiles[0].text
      return {
        code: `export default ${JSON.stringify(code)};`,
        map: null,
      }
    },
  }
}

export default defineConfig({
  plugins: [svelte(), script(), plugin() as any],
  resolve: {
    alias: {
      $lib: path.resolve('./src/lib'),
    },
  },
  build: {
    target: 'esnext',
    sourcemap: true,
  },
  test: {
    include: ['src/**/*.test.ts'],
  },
})
