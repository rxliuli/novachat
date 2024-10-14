import { derived, writable } from 'svelte/store'
import { uniqBy } from 'lodash-es'
import { type PluginManifest, pluginStore } from '$lib/plugins/store'
import type { ResolvedPlugin } from '../types/plugin'
import { loadRemotePlugins } from '$lib/plugins/command'

export const remotePlugins = writable<PluginManifest[]>([])

export const plugins = derived(
  [remotePlugins, pluginStore],
  ([$remotePlugins, $pluginStore]) =>
    uniqBy(
      $remotePlugins.concat($pluginStore.plugins.map((it) => it.manifest)),
      (it) => it.id,
    ).map((manifest) => {
      const findPlugin = $pluginStore.plugins.find(
        (it) => it.id === manifest.id,
      )
      return {
        manifest: manifest,
        installed: !!findPlugin,
        canUpdate:
          findPlugin?.manifest.version &&
          findPlugin.manifest.version !== manifest.version,
      } as ResolvedPlugin
    }),
)

export async function loadPlugins() {
  remotePlugins.set(await loadRemotePlugins())
}
