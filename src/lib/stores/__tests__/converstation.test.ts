// @vitest-environment happy-dom
import 'fake-indexeddb/auto'
import { expect, it } from 'vitest'
import { convStore } from '../converstation'
import { get } from 'svelte/store'
import { nanoid } from 'nanoid'
import { settingsStore } from '../settings'
import type { Message } from '$lib/types/Message'
import { dbApi, dbStore } from '$lib/api/db'

it('Create conversation', async () => {
  await convStore.init([])
  const id = nanoid()
  await convStore.create(id, get(settingsStore).defaultModel ?? 'gpt-4o', {
    id: nanoid(),
    content: 'Request',
    from: 'user',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  })
  expect(get(convStore).conversations).length(1)
  const message: Message = {
    id: nanoid(),
    content: '',
    from: 'assistant',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  await convStore.addMessage(id, message)
  await convStore.updateMessage(id, {
    ...message,
    content: 'Response',
  })
  expect(
    get(convStore).conversations[0].messages.map((it) => it.content),
  ).toEqual(['Request', 'Response'])
  const r = await dbApi.messages.getAll({ conversationId: id })
  expect(r.data.map((it) => it.content).sort()).toEqual(
    ['Request', 'Response'].sort(),
  )
  await convStore.deleteMessage(message.id)
  expect(get(convStore).conversations).length(1)
  // console.log(await dbApi.messages.getAll({ conversationId: id }))
})

it('Add attachment', async () => {
  await convStore.init([])
  const id = nanoid()
  const msgId = nanoid()
  await convStore.create(id, get(settingsStore).defaultModel ?? 'gpt-4o', {
    id: msgId,
    content: 'Request',
    from: 'user',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    attachments: [
      {
        id: nanoid(),
        url: 'https://picsum.photos/200/300',
        name: 'test.png',
        data: new Blob(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        type: 'image/jpeg',
      },
    ],
  })
  expect(await dbApi.attachments.getAllByMessageId(msgId)).length(1)
  const r = await dbApi.messages.getAll({ conversationId: id })
  expect(r.data[0].attachments).length(1)
})
