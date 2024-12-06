import '@vitest/web-worker'
import 'fake-indexeddb/auto'
import { expect, it } from 'vitest'
import { createModelCommand } from '../commands/model'
import { mkdir, writeFile } from 'fs/promises'
import { usedModelHistory, models, pluginStore } from '../store'
import { settingsStore } from '$lib/stores/settings'
import { produce } from 'immer'
import { definePluginProtocol, installPlugin } from '../command'
import path from 'pathe'
import { buildCode } from '../builder'
import manifest from './mock/openai/plugin.json'
import code from './mock/openai/index.ts?raw'
import { get } from 'svelte/store'

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
      type: 'llm',
      pluginId: 'openai',
    },
  ])
  settingsStore.update(
    produce((draft) => {
      draft.defaultModel = 'gpt-4o'
    }),
  )
  expect(pluginStore.getDefaultModel()?.id).eq('gpt-4o')
})

it.todo('activePlugin', async () => {
  pluginStore.reset()
  createModelCommand()
  await installPlugin({
    manifest,
    code,
    type: 'local',
  })
  const jsPath = path.resolve(__dirname, '.temp/index.js')
  await mkdir(path.dirname(jsPath), { recursive: true })
  await writeFile(jsPath, await buildCode(code))
  expect(get(pluginStore).models.some((it) => it.id === 'gpt-4o')).false
  const worker = new Worker(jsPath)
  const { sendMessage } = definePluginProtocol(worker, manifest.id)
  sendMessage('activate', {
    pluginId: manifest.id,
  })
  worker.terminate()
  await new Promise((resolve) => setTimeout(resolve, 1000))
  expect(get(pluginStore).models.some((it) => it.id === 'gpt-4o')).true
})

it('model history', async () => {
  pluginStore.reset()
  pluginStore.registerModels(
    ['a', 'b', 'c'].map((id) => ({
      id,
      name: id,
      pluginId: id,
      type: 'llm',
      command: { invoke: '', stream: '' },
    })),
  )
  expect(get(models).map((it) => it.id)).toEqual(['a', 'b', 'c'])
  usedModelHistory.use('c')
  await new Promise((resolve) => setTimeout(resolve, 10))
  expect(get(models).map((it) => it.id)).toEqual(['c', 'a', 'b'])
  usedModelHistory.use('a')
  await new Promise((resolve) => setTimeout(resolve, 10))
  expect(get(models).map((it) => it.id)).toEqual(['a', 'c', 'b'])
  usedModelHistory.use('b')
  await new Promise((resolve) => setTimeout(resolve, 10))
  expect(get(models).map((it) => it.id)).toEqual(['b', 'a', 'c'])
})
