import type {
  AttachmentDB,
  ConversationDB,
  IAttachmentDAO,
  IConversationDAO,
  IMessageDAO,
  MessageDB,
  PaginationOptions,
  PaginationResult,
} from '$lib/types/db'
import fs, { configure } from '@zenfs/core'
import { IndexedDB } from '@zenfs/dom'
import dayjs from 'dayjs'
import { openDB, type DBSchema, type IDBPDatabase, type IDBPIndex } from 'idb'
import { omit, pick } from 'lodash-es'

configure({
  mounts: {
    '/': IndexedDB,
  },
})

Reflect.set(globalThis, 'fs', fs.promises)

export const dbStore: DBStore = {} as any

export interface MyDB extends DBSchema {
  conversations: {
    key: string
    value: ConversationDB
    indexes: {
      'by-updated-at': string
    }
  }
  messages: {
    value: MessageDB
    key: string
    indexes: {
      'by-conversation-id-created-at': [string, string]
      'by-conversation-id': string
    }
  }
  attachments: {
    key: string
    value: AttachmentDB
    indexes: { 'by-message-id': string }
  }
}

export type DBStore = {
  idb: IDBPDatabase<MyDB>
}

export async function initDB() {
  dbStore.idb = await openDB('novachat', 1, {
    upgrade(db, _oldVersion, _newVersion, _transaction) {
      db.createObjectStore('conversations', {
        keyPath: 'id',
      }).createIndex('by-updated-at', 'updatedAt')

      const messagesStore = db.createObjectStore('messages', {
        keyPath: 'id',
      })
      messagesStore.createIndex('by-conversation-id-created-at', [
        'conversationId',
        'createdAt',
      ])
      messagesStore.createIndex('by-conversation-id', 'conversationId')

      db.createObjectStore('attachments', {
        keyPath: 'id',
      }).createIndex('by-message-id', 'messageId')
    },
  })
}

export const DEFAULT_PAGINATION_LIMIT = 20
export const MIN_DATE = dayjs().subtract(10, 'year').toISOString()
export const MAX_DATE = dayjs().add(10, 'year').toISOString()

export async function getPagination<
  T extends IDBPIndex<any, any, any, any, any>,
>(
  options: {
    index: T
  } & PaginationOptions,
): Promise<
  NonNullable<Awaited<ReturnType<(typeof options)['index']['get']>>>[]
> {
  let cursor = await options.index.openCursor(
    options.cursor ? IDBKeyRange.upperBound(options.cursor, true) : null,
    'prev',
  )
  const r: any[] = []
  let limit = options.limit ?? DEFAULT_PAGINATION_LIMIT
  while (cursor && limit > 0) {
    r.push(cursor.value)
    cursor = await cursor.continue()
    limit--
  }
  return r
}

export class ConversationDAO implements IConversationDAO {
  async getAll(
    options?: PaginationOptions,
  ): Promise<PaginationResult<ConversationDB>> {
    const conversations = await getPagination({
      index: dbStore.idb
        .transaction('conversations', 'readonly')
        .store.index('by-updated-at'),
      ...options,
    })
    if (conversations.length === 0) {
      return {
        data: [],
        nextCursor: undefined,
      }
    }
    const nextCursor =
      conversations[(options?.limit ?? DEFAULT_PAGINATION_LIMIT) - 1]?.updatedAt
    return {
      data: conversations,
      nextCursor: nextCursor,
    }
  }
  async create(conversation: ConversationDB): Promise<void> {
    await dbStore.idb.add('conversations', conversation)
  }
  async delete(id: string): Promise<void> {
    const txConv = dbStore.idb.transaction('conversations', 'readwrite')
    const txMsg = dbStore.idb.transaction('messages', 'readwrite')
    try {
      await Promise.all([
        txConv.store.delete(id),
        txMsg.store
          .index('by-conversation-id')
          .getAllKeys()
          .then((keys) => Promise.all(keys.map((k) => txMsg.store.delete(k)))),
      ])
    } catch (e) {
      console.error('Error deleting conversation', e)
      txConv.abort()
      txMsg.abort()
      throw e
    }
  }
  async update(
    conversation: Pick<ConversationDB, 'id'> &
      Partial<Pick<ConversationDB, 'updatedAt' | 'title'>>,
  ): Promise<void> {
    const table = dbStore.idb
      .transaction('conversations', 'readwrite')
      .objectStore('conversations')
    const existing = await table.get(conversation.id)
    if (!existing) {
      throw new Error('Conversation not found')
    }
    await dbStore.idb.put('conversations', {
      ...existing,
      ...pick(conversation, 'updatedAt', 'title'),
    })
  }
}

export class MessageDAO implements IMessageDAO {
  async create(message: MessageDB): Promise<void> {
    await dbStore.idb.add('messages', message)
  }
  async delete(id: string): Promise<void> {
    await dbStore.idb.delete('messages', id)
  }
  async update(message: MessageDB): Promise<void> {
    const table = dbStore.idb
      .transaction('messages', 'readwrite')
      .objectStore('messages')
    const existing = await table.get(message.id)
    if (!existing) {
      throw new Error('Message not found')
    }
    await dbStore.idb.put('messages', {
      ...existing,
      ...omit(message, 'id'),
    })
  }
  async getAll(
    options: { conversationId: string } & PaginationOptions,
  ): Promise<
    PaginationResult<
      MessageDB & {
        attachments: AttachmentDB[]
      }
    >
  > {
    let cursor = await dbStore.idb
      .transaction('messages', 'readonly')
      .store.index('by-conversation-id-created-at')
      .openCursor(
        IDBKeyRange.bound(
          [options.conversationId, MIN_DATE],
          [options.conversationId, options.cursor ?? MAX_DATE],
          false,
          true,
        ),
        'prev',
      )
    const messages: MessageDB[] = []
    let limit = options.limit ?? DEFAULT_PAGINATION_LIMIT
    while (cursor && limit > 0) {
      messages.push(cursor.value)
      cursor = await cursor.continue()
      limit--
    }
    const last = messages[(options?.limit ?? DEFAULT_PAGINATION_LIMIT) - 1]
    return {
      data: await Promise.all(
        messages.map(async (msg) => ({
          ...msg,
          attachments: await dbApi.attachments.getAllByMessageId(msg.id),
        })),
      ),
      nextCursor: last ? [last.conversationId, last.createdAt] : undefined,
    }
  }
  async deleteBatch(ids: string[]): Promise<void> {
    await Promise.all(ids.map((id) => this.delete(id)))
  }
}

export class AttachmentDAO implements IAttachmentDAO {
  async getAllByMessageId(messageId: string): Promise<AttachmentDB[]> {
    return await dbStore.idb.getAllFromIndex(
      'attachments',
      'by-message-id',
      messageId,
    )
  }
  async create(attachment: AttachmentDB): Promise<void> {
    await dbStore.idb.add('attachments', attachment)
  }
  async delete(id: string): Promise<void> {
    await dbStore.idb.delete('attachments', id)
  }
}

function wrap<T extends object>(obj: T): T {
  return new Proxy<T>({} as any, {
    get(_, p) {
      if (!(p in obj)) {
        return
      }
      if (typeof obj[p as keyof T] !== 'function') {
        return
      }
      return async (...args: any[]) => {
        if (!dbStore.idb) {
          await initDB()
        }
        return (obj[p as keyof T] as any)(...args)
      }
    },
  })
}

export const dbApi = {
  conversations: wrap(new ConversationDAO()),
  messages: wrap(new MessageDAO()),
  attachments: wrap(new AttachmentDAO()),
}
