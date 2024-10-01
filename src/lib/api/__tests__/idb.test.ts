import { beforeAll, describe, expect, it } from 'vitest'
import 'fake-indexeddb/auto'
import { openDB, type DBSchema, type IDBPDatabase, type IDBPIndex } from 'idb'
import { getPagination } from '../db'
import dayjs from 'dayjs'

describe('fake-indexeddb', () => {
  it('create idb', async () => {
    const db = await openDB<{
      books: {
        title: string
        author: string
        isbn: string
      }
    }>('test-1', 1, {
      upgrade(db) {
        db.createObjectStore('books', {
          autoIncrement: true,
          keyPath: 'isbn',
        })
      },
    })
    expect(await db.getAll('books')).empty
  })
  it('custom id', async () => {
    const db = await openDB<{
      books: {
        key: string
        value: {
          id: string
          name: string
        }
      }
    }>('test-2', 1, {
      upgrade(db) {
        db.createObjectStore('books', { keyPath: 'id' })
      },
    })
    await db.add('books', { id: '1', name: 'Book 1' })
  })
})

describe('index usage', () => {
  interface MyDB extends DBSchema {
    books: {
      key: string
      value: {
        name: string
        createdAt: string
      }
      indexes: {
        'by-created-at': string
      }
    }
    messages: {
      key: string
      value: {
        content: string
        chatId: string
        createdAt: string
      }
      indexes: {
        'by-chat-id-created-at': [string, string]
      }
    }
  }
  let db: IDBPDatabase<MyDB>
  beforeAll(async () => {
    db = await openDB<MyDB>('test-3', 1, {
      upgrade(db) {
        db.createObjectStore('books', {
          autoIncrement: true,
          keyPath: 'name',
        }).createIndex('by-created-at', 'createdAt')
        db.createObjectStore('messages', { autoIncrement: true }).createIndex(
          'by-chat-id-created-at',
          ['chatId', 'createdAt'],
        )
      },
    })
    await db.add('books', { name: 'Book 1', createdAt: '2024-01-01' })
    await db.add('books', { name: 'Book 2', createdAt: '2024-01-02' })
    await db.add('books', { name: 'Book 3', createdAt: '2024-01-03' })
    expect(await db.getAll('books')).length(3)
  })

  it('get books by created at', async () => {
    const books = await db.getAllFromIndex(
      'books',
      'by-created-at',
      '2024-01-02',
    )
    expect(books).toEqual([{ name: 'Book 2', createdAt: '2024-01-02' }])
  })
  // not exactly what we want, but it's a start
  it('get books before 2024-01-02', async () => {
    const range = IDBKeyRange.upperBound('2024-01-03', true)
    const r = await db.getAllFromIndex('books', 'by-created-at', range)
    expect(r).toEqual([
      { name: 'Book 1', createdAt: '2024-01-01' },
      { name: 'Book 2', createdAt: '2024-01-02' },
    ])
  })
  it('get books of last and limit 2', async () => {
    const r1 = await getPagination({
      index: db.transaction('books', 'readonly').store.index('by-created-at'),
      limit: 2,
    })
    expect(r1).toEqual([
      { name: 'Book 3', createdAt: '2024-01-03' },
      { name: 'Book 2', createdAt: '2024-01-02' },
    ])

    const r2 = await getPagination({
      index: db.transaction('books', 'readonly').store.index('by-created-at'),
      limit: 2,
      cursor: '2024-01-02',
    })
    expect(r2).toEqual([{ name: 'Book 1', createdAt: '2024-01-01' }])
  })

  it('complex index', async () => {
    await db.add('messages', {
      content: 'Message 1',
      chatId: 'chat-1',
      createdAt: '2024-01-01',
    })
    await db.add('messages', {
      content: 'Message 2',
      chatId: 'chat-2',
      createdAt: '2024-01-01',
    })
    await db.add('messages', {
      content: 'Message 3',
      chatId: 'chat-1',
      createdAt: '2024-01-03',
    })
    await db.add('messages', {
      content: 'Message 4',
      chatId: 'chat-1',
      createdAt: '2024-01-04',
    })

    // get last 2 messages of chat-1
    const r1 = await getPagination({
      index: db
        .transaction('messages', 'readonly')
        .store.index('by-chat-id-created-at'),
      limit: 2,
      cursor: ['chat-1', new Date().toISOString()],
    })
    expect(r1).toEqual([
      { content: 'Message 4', chatId: 'chat-1', createdAt: '2024-01-04' },
      { content: 'Message 3', chatId: 'chat-1', createdAt: '2024-01-03' },
    ])

    // get messages of chat-1 before 2024-01-03
    const r2 = await getPagination({
      index: db
        .transaction('messages', 'readonly')
        .store.index('by-chat-id-created-at'),
      limit: 2,
      cursor: ['chat-1', '2024-01-03'],
    })
    expect(r2).toEqual([
      { content: 'Message 1', chatId: 'chat-1', createdAt: '2024-01-01' },
    ])

    // get messages of chat-1
    const r3 = await getPagination({
      index: db
        .transaction('messages', 'readonly')
        .store.index('by-chat-id-created-at'),
      limit: 100,
      cursor: ['chat-1', new Date().toISOString()],
    })
    expect(r3).length(3)
  })

  it('complex index 2', async () => {
    const db = await openDB<{
      messages: {
        value: {
          id: string
          conversationId: string
          createdAt: string
        }
        key: string
        indexes: {
          'by-conversation-id-created-at': [string, string]
          'by-conversation-id': string
        }
      }
    }>('test-4', 1, {
      upgrade(db) {
        const messagesStore = db.createObjectStore('messages', {
          keyPath: 'id',
        })
        messagesStore.createIndex('by-conversation-id-created-at', [
          'conversationId',
          'createdAt',
        ])
        messagesStore.createIndex('by-conversation-id', 'conversationId')
      },
    })
    await Promise.all(
      Array.from({ length: 10 }).map(async (_, i) => {
        await db.add('messages', {
          id: i.toString(),
          conversationId: `chat-${i % 2}`,
          createdAt: dayjs().add(i, 'day').toISOString(),
        })
      }),
    )
    const r = await db.getAllFromIndex(
      'messages',
      'by-conversation-id-created-at',
      IDBKeyRange.bound(
        ['chat-1', dayjs().subtract(1, 'year').toISOString()],
        ['chat-1', dayjs().add(1, 'year').toISOString()],
        false,
        true,
      ),
    )
    expect(r).length(5)
  })
})
