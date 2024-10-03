import '@vitest/web-worker'
import 'fake-indexeddb/auto'
import { expect, it } from 'vitest'
import { createModelCommand } from '../commands/model'
import { pluginStore } from '$lib/plugins/store'
import { settingsStore } from '$lib/stores/settings'
import { produce } from 'immer'
import { activePluginFromLocal, definePluginProtocol, installPlugin } from '../command'
import fs from '@zenfs/core'
import manifest from './mock/openai/plugin.json'
import code from './mock/openai/index.ts?raw'
import { buildCode } from '../builder'
import { mkdir, writeFile } from 'fs/promises'
import path from 'path'

it('createModelCommand', async () => {
  createModelCommand()
  expect(pluginStore.getDefaultModel()).undefined
  pluginStore.registerModels([
    {
      id: 'gpt-4o',
      name: 'GPT-4o',
      command: {
        invoke: '',
        stream: '',
      },
    },
  ])
  settingsStore.update(
    produce((draft) => {
      draft.defaultModel = 'gpt-4o'
    }),
  )
  expect(pluginStore.getDefaultModel()?.id).eq('gpt-4o')
})

it('activePlugin', async () => {
  createModelCommand()
  await installPlugin(manifest, code)
  const jsPath = path.resolve(__dirname, '.temp/index.js')
  await mkdir(path.dirname(jsPath), { recursive: true })
  await writeFile(jsPath, await buildCode(code))
  const worker = new Worker(jsPath)
  const { sendMessage } = definePluginProtocol(worker)
  // await sendMessage('activate', {})
  // await activePlugin(manifest.id)
})
