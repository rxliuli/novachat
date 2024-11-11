// @vitest-environment happy-dom
import 'fake-indexeddb/auto'
import { beforeEach, describe, expect, it } from 'vitest'
import { convStore } from '../converstation.svelte.svelte'
import { get } from 'svelte/store'
import { nanoid } from 'nanoid'
import { settingsStore } from '../settings'
import type { Message } from '$lib/types/Message'
import { dbApi, dbStore } from '$lib/api/db'
import dayjs from 'dayjs'
import { sortBy } from 'lodash-es'

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

it('loadMessage', async () => {
  const chatId1 = nanoid()
  await convStore.init([
    {
      id: chatId1,
      model: 'gpt-4o',
      title: 'test',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [],
    },
  ])
  await Promise.all(
    Array.from({ length: 10 }).map(async (_, i) => {
      return dbApi.messages.create({
        id: (i + 1).toString(),
        conversationId: chatId1,
        content: 'Request',
        from: i % 2 === 0 ? 'user' : 'assistant',
        createdAt: dayjs().subtract(i, 'day').toISOString(),
        updatedAt: dayjs().subtract(i, 'day').toISOString(),
      })
    }),
  )
  await convStore.loadMessages(chatId1)
  const messages = get(convStore).conversations[0].messages
  expect(messages).length(10)
  expect(messages).toEqual(sortBy(messages, 'createdAt'))
})

describe('Retry message', async () => {
  beforeEach(async () => {
    await dbStore.idb.clear('messages')
  })
  it('should retry message', async () => {
    await convStore.init([])
    const id = nanoid()
    const msgId = nanoid()
    await convStore.create(id, get(settingsStore).defaultModel ?? 'gpt-4o', {
      id: msgId,
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
    await convStore.deleteMessage(id)
  })
  it("don't delete all messages on retry", async () => {
    const chatId1 = nanoid()
    const chatId2 = nanoid()
    await Promise.all(
      Array.from({ length: 10 }).map(async (_, i) => {
        return dbApi.messages.create({
          id: (i + 1).toString(),
          conversationId: chatId1,
          content: 'Request',
          from: i % 2 === 0 ? 'user' : 'assistant',
          createdAt: dayjs().subtract(i, 'day').toISOString(),
          updatedAt: dayjs().subtract(i, 'day').toISOString(),
        })
      }),
    )
    expect(await dbStore.idb.getAll('messages')).length(10)
    await convStore.init([])
    await convStore.create(chatId2, 'gpt-4o', {
      id: '11',
      content: 'Request',
      from: 'user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    await convStore.addMessage(chatId2, {
      id: '12',
      content: 'Response',
      from: 'assistant',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    expect(await dbStore.idb.getAll('messages')).length(12)
    await convStore.retryMessage('11')
    expect(await dbStore.idb.getAll('messages')).length(11)
  })
})
