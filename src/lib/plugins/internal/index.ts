import openaiManifest from './openai/plugin.json'
import openaiCode from './openai/index.ts?plugin'
import translatorCode from './translator/index.ts?plugin'
import translatorManifest from './translator/plugin.json'
import type { PluginLoadResult } from '../command'

export const internalPlugins: PluginLoadResult[] = [
  {
    manifest: openaiManifest,
    code: openaiCode,
    type: 'internal',
  },
  {
    manifest: translatorManifest,
    code: translatorCode,
    type: 'internal',
  },
]
