import type { PluginLoadResult } from '../command'

export const internalPlugins: PluginLoadResult[] = []

if (import.meta.env.DEV) {
  // internalPlugins.push({
  //   manifest: (await import('./demo/plugin.json')).default,
  //   code: (await import('./demo/index.ts?plugin')).default,
  //   type: 'internal',
  // })
}
