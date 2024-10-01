import { dbStore } from '$lib/api/db'
import type { Conversation } from '$lib/types/Conversation'
import type { AttachmentDB, ConversationDB, MessageDB } from '$lib/types/db'
import { omit } from 'lodash-es'
import { nanoid } from 'nanoid'

function migrateConversations(conversations: Conversation[]) {
  return conversations.map((c) => omit(c, 'messages') satisfies ConversationDB)
}

function migrateMessages(conversations: Conversation[]) {
  return conversations.flatMap((c) =>
    c.messages.map(
      (msg) =>
        ({
          ...omit(msg, 'attachments'),
          conversationId: c.id,
        } satisfies MessageDB),
    ),
  )
}

function migrateAttachments(conversations: Conversation[]) {
  return conversations
    .flatMap((c) => c.messages)
    .flatMap(
      (msg) =>
        msg.attachments?.map(
          (atta) =>
            ({
              ...omit(atta, 'url'),
              id: nanoid(),
              messageId: msg.id,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            } satisfies Omit<AttachmentDB, 'data'>),
        ) ?? [],
    )
}

export async function migrateLocalStorageToIdb() {
  const old = localStorage.getItem('conversations')
  if (old === null) {
    return
  }
  const conversations = JSON.parse(old) as Conversation[]
  console.log('conversations', conversations)
  await Promise.all(
    migrateConversations(conversations).map(async (c) => {
      if (!(await dbStore.idb.get('conversations', c.id))) {
        console.log('adding conversation', c.title)
        await dbStore.idb.add('conversations', c)
      }
    }),
  )
  await Promise.all(
    migrateMessages(conversations).map(async (it) => {
      if (!(await dbStore.idb.get('messages', it.id))) {
        console.log('adding message', it.id)
        await dbStore.idb.add('messages', it)
      }
    }),
  )
  // await Promise.all(
  //   migrateAttachments(conversations).map(async (it) => {
  //     if (!(await dbStore.idb.get('attachments', it.id))) {
  //       console.log('adding attachment', it.id)
  //       const blob = await dataURItoBlob(it.url)
  //       await dbStore.idb.add('attachments', {
  //         ...omit(it, 'url'),
  //         data: blob,
  //       })
  //     }
  //   }),
  // )
}
