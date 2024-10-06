import { build, initialize, type Plugin } from 'esbuild-wasm'
import wasmURL from 'esbuild-wasm/esbuild.wasm?url'
import loaderRaw from './client/loader.ts?raw'
import addInterceptorRaw from './client/addInterceptor.ts?script'
import pluginLibRaw from '@novachat/plugin/internal?raw'
import { once } from '@liuli-util/async'

const initESBuild = once(async () => {
  if (typeof window === 'undefined') {
    return
  }
  await initialize({ wasmURL })
})

export function vfs(files: { path: string; content: string }[]): Plugin {
  return {
    name: 'vfs',
    setup(build) {
      build.onResolve({ filter: /()/ }, ({ path }) => {
        const file = files.find((f) => f.path === path)
        if (file) {
          return {
            path,
            namespace: 'vfs',
            pluginData: file.content,
          }
        }
      })
      build.onLoad({ filter: /.*/, namespace: 'vfs' }, ({ pluginData }) => {
        return {
          contents: pluginData,
          loader: 'ts',
        }
      })
    },
  }
}

// build in service worker
export async function buildCode(code: string): Promise<string> {
  await initESBuild()
  const out = await build({
    entryPoints: ['loader.ts'],
    bundle: true,
    write: false,
    format: 'esm',
    minify: false,
    sourcemap: 'inline',
    plugins: [
      vfs([
        {
          path: 'loader.ts',
          content: loaderRaw,
        },
        {
          path: './index',
          content: code,
        },
        {
          path: '@novachat/plugin',
          content: 'export * from "@novachat/plugin/internal"',
        },
        {
          path: '@novachat/plugin/internal',
          content: pluginLibRaw,
        },
        {
          path: './addInterceptor',
          content: addInterceptorRaw,
        },
      ]),
    ],
  })
  return out.outputFiles[0].text
}
