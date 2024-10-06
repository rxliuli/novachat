import fs from '@zenfs/core'
import { buildCode } from './builder'
import type {
  PluginExportType,
  PluginImportType,
} from '@novachat/plugin/internal'
import { defineMessaging } from './messging'
import {
  installedPlugins,
  pluginStore,
  type PluginInstallState,
  type PluginManifest,
} from './store'
import JSZip from 'jszip'
import { get, set } from 'idb-keyval'
import { initSystemCommand } from './commands/model'
import { get as getStore } from 'svelte/store'
import { uniqBy } from 'lodash-es'

export function definePluginProtocol(port: Worker, pluginId: string) {
  const { onMessage } = defineMessaging<PluginImportType>()
  onMessage(port, 'register', async ({ id, cb }) =>
    pluginStore.addCommand({ type: 'plugin', id, handler: cb, pluginId }),
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
  if (
    getStore(pluginStore).plugins.some((it) => it.id === loader.manifest.id)
  ) {
    throw new Error(`Plugin ${loader.manifest.id} already active`)
  }
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
  const { sendMessage } = definePluginProtocol(worker, loader.manifest.id)
  await sendMessage('activate', {
    pluginId: loader.manifest.id,
  })
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
  return plugin.id
}

export async function installPlugin(loadResult: PluginLoadResult) {
  stopPlugin(loadResult.manifest.id)
  const pluginDIr = `/plugins/${loadResult.manifest.id}/`
  await fs.promises.mkdir(pluginDIr, { recursive: true })
  await fs.promises.writeFile(
    `${pluginDIr}/plugin.json`,
    JSON.stringify(loadResult.manifest, null, 2),
  )
  await fs.promises.writeFile(`${pluginDIr}/index.js`, loadResult.code)
  set(
    'plugins',
    uniqBy(
      [
        ...((await get('plugins')) ?? []),
        { id: loadResult.manifest.id, enabled: true },
      ] as PluginInstallState[],
      (it) => it.id,
    ),
  )
}

export interface PluginLoadResult {
  manifest: PluginManifest
  code: string
  type: 'local' | 'internal'
}

export async function loadInstalledPlugins(): Promise<PluginLoadResult[]> {
  const list = getStore(installedPlugins)
  const plugins = (
    await Promise.all(
      list.map(async (it) => {
        if (
          !(await fs.promises.exists(`/plugins/${it.id}/plugin.json`)) ||
          !(await fs.promises.exists(`/plugins/${it.id}/index.js`))
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
  initSystemCommand()
  const plugins = [
    ...(await import('$lib/plugins/internal')).internalPlugins,
    ...(await loadInstalledPlugins()),
  ]
  for (const it of plugins) {
    try {
      await activePlugin(it)
    } catch (err) {
      console.error(`Failed to active plugin ${it.manifest.id}`, err)
    }
  }
}

export async function destoryPluginSystem() {
  const store = getStore(pluginStore)
  store.plugins.forEach((it) => {
    it.worker.terminate()
  })
  pluginStore.reset()
}

export async function uninstallPlugin(id: string) {
  pluginStore.destoryPluginContext(id)
  installedPlugins.update((draft) => {
    return draft.filter((it) => it.id !== id)
  })
  await fs.promises.rm(`/plugins/${id}`, { recursive: true, force: true })
}

export function stopPlugin(id: string) {
  const store = getStore(pluginStore)
  const plugin = store.plugins.find((it) => it.id === id)
  if (!plugin) {
    return
  }
  plugin.worker.terminate()
  pluginStore.destoryPluginContext(id)
}

export async function loadRemotePlugins() {
  const r = await fetch(
    'https://raw.githubusercontent.com/novachat/plugins/refs/heads/main/plugins.json',
  )
  return Object.values((await r.json()) as Record<string, PluginManifest>)
}

export async function installPluginForRemote(manifest: PluginManifest) {
  const r = await fetch(
    import.meta.env.VITE_REVERSE_PROXY_URL +
      '?url=' +
      `https://github.com/novachat/plugins/raw/refs/heads/main/plugins/${manifest.id}/plugin.zip`,
  )
  if (!r.ok) {
    throw new Error('Failed to download plugin' + r.statusText)
  }
  const zip = await new JSZip().loadAsync(await r.blob())
  const code = await zip.file('index.js')?.async('string')
  if (!code) {
    throw new Error('Failed to install plugin')
  }
  await installPlugin({ manifest, code, type: 'local' })
}
