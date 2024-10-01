import { indexedDBAdapter, localStore } from '../utils/localStore'

type Settings = {
  theme?: 'system' | 'light' | 'dark'
  defaultModel?: string
  apiKey?: string
  baseUrl?: string
}

export const settingsStore = localStore<Settings>(
  'NOVACHAT_SETTINGS',
  {},
  indexedDBAdapter(),
)
