import { derived } from 'svelte/store'
import { indexedDBAdapter, localStore } from '../utils/localStore'
import { pluginStore } from '$lib/plugins/store'
import type { SettingSchema } from '$lib/types/Settings'

type Settings = {
  theme?: 'system' | 'light' | 'dark'
  defaultModel?: string
}

export const settingsStore = localStore<Settings>(
  'NOVACHAT_SETTINGS',
  {},
  indexedDBAdapter(),
)

export const settingSchemaStore = derived(
  pluginStore,
  (draft) =>
    [
      {
        title: 'system',
        properties: {
          theme: {
            type: 'string',
            enum: ['system', 'light', 'dark'],
            enumDescriptions: ['System', 'Light', 'Dark'],
            description: 'System theme',
            default: 'system',
          },
          defaultModel: {
            type: 'string',
            enum: draft.models.map((it) => it.id),
            enumDescriptions: draft.models.map((it) => it.name),
            description: 'Default model',
          },
        },
      },
      ...draft.plugins
        .filter((it) => it.manifest.configuration)
        .map((it) => it.manifest.configuration),
    ] as SettingSchema[],
)
