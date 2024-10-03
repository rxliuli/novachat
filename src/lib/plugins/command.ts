import fs from '@zenfs/core'
import { buildCode } from './builder'
import type { PluginExportType, PluginImportType } from './protocol'
import { defineMessaging } from './messging'
import { pluginStore, type PluginManifest } from './store'
import JSZip from 'jszip'
import { get, set } from 'idb-keyval'
import { createModelCommand } from './commands/model'
import { get as getStore } from 'svelte/store'

export function definePluginProtocol(port: Worker) {
  const { onMessage } = defineMessaging<PluginImportType>()
  onMessage(port, 'register', async ({ id, cb }) =>
    pluginStore.addCommand({ type: 'plugin', id, handler: cb }),
  )
  onMessage(port, 'unregister', ({ id }) => pluginStore.deleteCommand(id))
  onMessage(port, 'execute', async (options) =>
    pluginStore.executeCommand(options.id, ...(options.args ?? [])),
  )
  return {
    sendMessage<T extends keyof PluginExportType>(
      k: T,
      ...args: Parameters<PluginExportType[T]>
    ) {
      return defineMessaging().sendMessage(port, k, ...args)
    },
  }
}

// run in main thread, create a new worker
export async function activePluginFromLocal(id: string) {
  const manifest = JSON.parse(
    await fs.promises.readFile(`/plugins/${id}/plugin.json`, 'utf-8'),
  )
  const code = await fs.promises.readFile(`/plugins/${id}/index.js`, 'utf-8')
  await activePlugin({ manifest, code, type: 'local' })
}

export async function activePlugin(loader: PluginLoadResult) {
  const workerCode = await buildCode(loader.code)
  const url = URL.createObjectURL(
    new Blob([workerCode], { type: 'application/javascript' }),
  )
  const worker = new Worker(url, {
    type: 'module',
    name: `[plugin] ${loader.manifest.id}`,
  })
  pluginStore.addPlugin({
    id: loader.manifest.id,
    worker,
    manifest: loader.manifest,
  })
  const { sendMessage } = definePluginProtocol(worker)
  await sendMessage('activate', {})
}

// run in main thread
export async function installPluginFromZip(blob: Blob) {
  const zip = await new JSZip().loadAsync(blob)
  const pluginJson = await zip.file('plugin.json')?.async('string')
  const indexJs = await zip.file('index.js')?.async('string')
  if (!pluginJson || !indexJs) {
    throw new Error('Invalid plugin zip')
  }
  const plugin = JSON.parse(pluginJson) as PluginManifest
  await installPlugin({ manifest: plugin, code: indexJs, type: 'local' })
}

export async function installPlugin(loadResult: PluginLoadResult) {
  const pluginDIr = `/plugins/${loadResult.manifest.id}/`
  await fs.promises.mkdir(pluginDIr, { recursive: true })
  await fs.promises.writeFile(
    `${pluginDIr}/plugin.json`,
    JSON.stringify(loadResult.manifest, null, 2),
  )
  await fs.promises.writeFile(`${pluginDIr}/index.js`, loadResult.code)
  set('plugins', [
    ...((await get('plugins')) ?? []),
    { id: loadResult.manifest.id, enabled: true },
  ])
}

export interface PluginLoadResult {
  manifest: PluginManifest
  code: string
  type: 'local' | 'internal'
}

export async function loadInstalledPlugins(): Promise<PluginLoadResult[]> {
  const list = ((await get('plugins')) ?? []) as {
    id: string
    enabled: boolean
  }[]
  const plugins = (
    await Promise.all(
      list.map(async (it) => {
        if (
          !(await pathExists(`/plugins/${it.id}/plugin.json`)) ||
          !(await pathExists(`/plugins/${it.id}/index.js`))
        ) {
          return
        }
        const manifest = JSON.parse(
          await fs.promises.readFile(`/plugins/${it.id}/plugin.json`, 'utf-8'),
        )
        const code = await fs.promises.readFile(
          `/plugins/${it.id}/index.js`,
          'utf-8',
        )
        return { manifest, code }
      }),
    )
  ).filter((it) => it)
  return plugins as PluginLoadResult[]
}

export async function initPluginSystem() {
  createModelCommand()
  const plugins = [
    ...(await import('$lib/plugins/internal')).internalPlugins,
    ...(await loadInstalledPlugins()),
  ]
  await Promise.all(plugins.map(activePlugin))
}

export async function destoryPluginSystem() {
  const store = getStore(pluginStore)
  store.plugins.forEach((it) => {
    it.worker.terminate()
  })
  store.plugins = []
  store.commands = []
  store.models = []
}

const pathExists = (p: string) =>
  fs.promises
    .exists(p)
    .then(() => true)
    .catch(() => false)
