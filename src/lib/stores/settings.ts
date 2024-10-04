import { derived } from 'svelte/store'
import { indexedDBAdapter, localStore } from '../utils/localStore'

type Settings = {
  theme?: 'system' | 'light' | 'dark'
  defaultModel?: string
}

export const settingsStore = localStore<Settings & Record<string, any>>(
  'NOVACHAT_SETTINGS',
  {},
  indexedDBAdapter(),
)


