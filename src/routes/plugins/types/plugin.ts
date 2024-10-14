import type { PluginManifest } from '$lib/plugins/store'

export interface ResolvedPlugin {
  manifest: PluginManifest
  installed: boolean
  canUpdate: boolean
}
