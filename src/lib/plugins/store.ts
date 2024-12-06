import { settingsStore } from '$lib/stores/settings'
import type { SettingSchema } from '$lib/types/Settings'
import { indexedDBAdapter, localStore } from '$lib/utils/localStore'
import { produce } from 'immer'
import { sortBy, uniqBy } from 'lodash-es'
import { derived, get, writable } from 'svelte/store'

interface Command {
  type: 'system' | 'plugin'
  id: string
  handler: Function
  pluginId?: string
}

export interface PluginManifest {
  id: string
  name: string
  version: string
  description?: string
  author?: string
  homepage?: string
  repository?: string
  lastUpdated?: string
  icons?: Record<string, string>
  configuration?: SettingSchema
}

interface ActivatedPlugin {
  id: string
  worker: Worker
  manifest: PluginManifest
}

export interface ActivatedModel {
  id: string
  name: string
  pluginId: string
  command: {
    invoke: string
    stream: string
  }
  type: 'llm' | 'bot'
}

const store = writable({
  commands: [] as Command[],
  plugins: [] as ActivatedPlugin[],
  models: [] as ActivatedModel[],
})

const _usedModelHistory = localStore(
  'modelHistory',
  {} as Record<string, string>,
  indexedDBAdapter(),
)

export const usedModelHistory = {
  use: (id: string) => {
    _usedModelHistory.update(
      produce((draft) => {
        draft[id] = new Date().toISOString()
      }),
    )
  },
}

export const models = derived(
  [store, _usedModelHistory],
  ([$store, _usedModelHistory]) => {
    return [...$store.models].sort((a, b) => {
      const aUsedAt = _usedModelHistory[a.id]
      const bUsedAt = _usedModelHistory[b.id]
      if (aUsedAt && bUsedAt) {
        return bUsedAt.localeCompare(aUsedAt)
      }
      if (!aUsedAt && !bUsedAt) {
        return a.name.localeCompare(b.name)
      }
      if (aUsedAt) {
        return -1
      }
      return 1
    })
  },
)

export interface PluginInstallState {
  id: string
  enabled: boolean
}

export const installedPlugins = localStore<PluginInstallState[]>(
  'plugins',
  [],
  indexedDBAdapter(),
)

export const pluginStore = {
  subscribe: store.subscribe,
  addCommand(command: Command) {
    store.update(
      produce((draft) => {
        draft.commands.push(command)
      }),
    )
  },
  deleteCommand(id: string) {
    store.update(
      produce((draft) => {
        draft.commands = draft.commands.filter((c) => c.id !== id)
      }),
    )
  },
  executeCommand(id: string, ...args: any[]) {
    const cmd = get(store).commands.find((c) => c.id === id)
    if (!cmd) {
      throw new Error(`command ${id} not found`)
    }
    return cmd.handler(...args)
  },
  registerModels(models: ActivatedModel[]) {
    store.update(
      produce((draft) => {
        draft.models = uniqBy([...draft.models, ...models], (it) => it.id)
      }),
    )
  },
  getDefaultModel() {
    const defaultModel = get(settingsStore).defaultModel
    if (!defaultModel) {
      return
    }
    return get(pluginStore).models.find((it) => it.id === defaultModel)
  },
  addPlugin(plugin: ActivatedPlugin) {
    store.update(
      produce((draft) => {
        draft.plugins.push(plugin)
      }),
    )
  },
  destoryPluginContext(id: string) {
    store.update(
      produce((draft) => {
        draft.plugins = draft.plugins.filter((p) => p.id !== id)
        draft.commands = draft.commands.filter((c) => c.pluginId !== id)
        draft.models = draft.models.filter((m) => m.pluginId !== id)
      }),
    )
  },
  reset() {
    store.set({
      commands: [],
      plugins: [],
      models: [],
    })
  },
}
