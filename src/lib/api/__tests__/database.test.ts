import 'fake-indexeddb/auto'
import { beforeAll, beforeEach, describe, expect, it } from 'vitest'
import {
  AttachmentDAO,
  ConversationDAO,
  dbApi,
  dbStore,
  initDB,
  MessageDAO,
} from '../db'
import type {
  AttachmentDB,
  ConversationDB,
  MessageDB,
  PaginationResult,
} from '$lib/types/db'
import dayjs from 'dayjs'
import { sortBy } from 'lodash-es'

beforeAll(async () => {
  await initDB()
  expect(dbStore.idb).not.undefined
})

describe('ConversationDAO', () => {
  it('create/update/delete', async () => {
    const dao = new ConversationDAO()
    const conv: ConversationDB = {
      id: '1',
      title: 'Test',
      model: 'gpt-4o',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    await dao.create(conv)
    const r1 = await dao.getAll()
    expect(r1).toEqual({
      data: [conv],
    } as PaginationResult<ConversationDB>)
    await dao.update({
      id: '1',
      title: 'Test 2',
    })
    const r2 = await dao.getAll()
    expect(r2.data[0].title).toEqual('Test 2')
    await dao.delete('1')
    const r3 = await dao.getAll()
    expect(r3.data).toEqual([])
  })
  it('pagination', async () => {
    const dao = new ConversationDAO()
    await Promise.all(
      Array.from({ length: 10 }).map(async (_, i) => {
        const d = dayjs().add(i, 'day').toISOString()
        return dao.create({
          id: i.toString(),
          title: `Test ${i}`,
          model: 'gpt-4o',
          createdAt: d,
          updatedAt: d,
        })
      }),
    )
    const r: ConversationDB[] = []
    let page = await dao.getAll({ limit: 2 })
    r.push(...page.data)
    while (page.nextCursor) {
      page = await dao.getAll({ limit: 2, cursor: page.nextCursor })
      r.push(...page.data)
    }
    expect(r).length(10)
    expect(r).toEqual(sortBy(r, (it) => -dayjs(it.createdAt).unix()))
  })
  it('delete', async () => {
    await dbApi.conversations.create({
      id: 'chat-1',
      title: 'Test',
      model: 'gpt-4o',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    await dbApi.messages.create({
      id: 'msg-1',
      conversationId: 'chat-1',
      content: 'Test',
      from: 'user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    await dbApi.messages.create({
      id: 'msg-2',
      conversationId: 'chat-2',
      content: 'Test',
      from: 'user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    await dbApi.conversations.delete('chat-1')
    expect(
      (await dbApi.messages.getAll({ conversationId: 'chat-1' })).data,
    ).toEqual([])
  })
})

describe('MessageDAO', () => {
  beforeEach(async () => {
    await dbStore.idb!.clear('messages')
  })
  it('create/update/delete', async () => {
    const dao = new MessageDAO()
    expect((await dao.getAll({ conversationId: 'chat-1' })).data).empty
    const msg: MessageDB = {
      id: '1',
      conversationId: 'chat-1',
      content: 'Test',
      from: 'user',
      createdAt: new Date('2024-01-01').toISOString(),
      updatedAt: new Date('2024-01-01').toISOString(),
    }
    await dao.create(msg)
    const r1 = await dao.getAll({ conversationId: 'chat-1' })
    expect(r1).toEqual({
      data: [{ ...msg, attachments: [] }],
    } as PaginationResult<MessageDB & { attachments: AttachmentDB[] }>)
    await dao.update({
      ...msg,
      content: 'Test 2',
    })
    const r2 = await dao.getAll({ conversationId: 'chat-1' })
    expect(r2.data[0].content).eq('Test 2')
    await dao.delete('1')
    const r3 = await dao.getAll({ conversationId: 'chat-1' })
    expect(r3.data).length(0)
  })

  it('pagination', async () => {
    const dao = new MessageDAO()
    await Promise.all(
      Array.from({ length: 10 }).map(async (_, i) => {
        const d = dayjs().add(i, 'day').toISOString()
        return await dao.create({
          id: i.toString(),
          conversationId: `chat-${i % 2}`,
          content: `Test ${i}`,
          createdAt: d,
          updatedAt: d,
          from: 'user',
        })
      }),
    )
    const r = (await dao.getAll({ conversationId: 'chat-1' })).data
    expect(r.map((it) => it.id)).toEqual(['9', '7', '5', '3', '1'])
    expect(r).length(5)
  })
})

describe('AttachmentDAO', () => {
  it('getAllByMessageId', async () => {
    const dao = new AttachmentDAO()
    await dao.create({
      id: '1',
      messageId: 'msg-1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      name: 'test.png',
      data: new Blob(),
      type: 'image/jpeg',
    })
    const r = await dao.getAllByMessageId('msg-1')
    expect(r).length(1)
  })
})

describe('dbApi', () => {
  it('conversations', async () => {
    await dbStore.idb.clear('conversations')
    dbStore.idb = undefined as any
    const conversations = await dbApi.conversations.getAll()
    expect(conversations.data).toEqual([])
  })
})
