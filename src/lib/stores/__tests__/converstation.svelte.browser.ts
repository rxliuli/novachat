import { beforeEach, expect, it } from 'vitest'
import { convStore } from '../converstation.svelte'
import { get } from 'svelte/store'
import { nanoid } from 'nanoid'
import type { Attachment, Message } from '$lib/types/Message'
import { dbStore, initDB } from '$lib/api/db'

beforeEach(async () => {
  await initDB()
  await dbStore.idb.clear('messages')
  await dbStore.idb.clear('conversations')
  await dbStore.idb.clear('attachments')
})

it('Create conversation and add attachment(svelte 5 and immer)', async () => {
  await convStore.init([])
  const id = nanoid()
  const atta = $state({
    id: nanoid(),
    url: 'test',
    name: 'test',
    type: 'image/jpeg',
    data: new Blob(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  } as Attachment)
  await convStore.create(id, 'gpt-4o', {
    id: nanoid(),
    content: 'Request',
    from: 'user',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    attachments: [atta],
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
})
