import { dbApi } from '$lib/api/db'
import type { Conversation } from '$lib/types/Conversation'
import type { Message } from '$lib/types/Message'
import { blobToDataURI } from '$lib/utils/datauri'
import { produce } from 'immer'
import { omit, sortBy } from 'lodash-es'
import { get, writable } from 'svelte/store'

type Store = {
  id: string
  conversations: Conversation[]
  newConv: boolean
}

const store = writable<Store>({
  id: '',
  conversations: [],
  newConv: false,
})

export const convStore = {
  subscribe: store.subscribe,
  init: async (conversations: Conversation[]) => {
    store.update((state) => ({
      ...state,
      conversations,
    }))
  },
  create: async (id: string, model: string, message: Message) => {
    store.update((state) => ({
      ...state,
      id: id,
      conversations: [
        ...state.conversations,
        {
          id,
          messages: [message],
          title: 'New Chat',
          model,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      newConv: true,
    }))

    await Promise.all([
      dbApi.conversations.create({
        id,
        model,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        title: 'New Chat',
      }),
      dbApi.messages.create({
        ...$state.snapshot(message),
        conversationId: id,
      }),
      ...(message.attachments ?? []).map((atta) =>
        dbApi.attachments.create({
          ...omit(atta, 'url'),
          messageId: message.id,
        }),
      ),
    ])
  },
  updateTitle: async (id: string, title: string) => {
    store.update((state) => ({
      ...state,
      conversations: state.conversations.map((conversation) =>
        conversation.id === id
          ? { ...conversation, title, updatedAt: new Date().toISOString() }
          : conversation,
      ),
    }))
    await dbApi.conversations.update({
      id,
      title,
      updatedAt: new Date().toISOString(),
    })
  },
  addMessage: async (id: string, message: Message) => {
    store.update((state) => ({
      ...state,
      conversations: state.conversations.map((conversation) =>
        conversation.id === id
          ? { ...conversation, messages: [...conversation.messages, message] }
          : conversation,
      ),
    }))
    await Promise.all([
      dbApi.conversations.update({
        id,
        updatedAt: new Date().toISOString(),
      }),
      dbApi.messages.create({
        ...$state.snapshot(message),
        conversationId: id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }),
      ...(message.attachments ?? []).map((atta) =>
        dbApi.attachments.create({
          ...omit(atta, 'url'),
          messageId: message.id,
        }),
      ),
    ])
  },
  updateMessage: async (id: string, message: Message) => {
    store.update((state) => ({
      ...state,
      conversations: state.conversations.map((conversation) =>
        conversation.id === id
          ? {
              ...conversation,
              messages: conversation.messages.map((it) => {
                if (it.id !== message.id) {
                  return it
                }
                return {
                  ...it,
                  ...message,
                  updatedAt: new Date().toISOString(),
                }
              }),
            }
          : conversation,
      ),
    }))
    await dbApi.messages.update({
      ...$state.snapshot(message),
      conversationId: id,
      updatedAt: new Date().toISOString(),
    })
  },
  retryMessage: async (messageId: string) => {
    let deleteMessages: string[] = []
    store.update(
      produce((draft) => {
        const conversation = draft.conversations.find(
          (it) => it.id === draft.id,
        )
        if (!conversation) {
          return
        }
        const findIndex = conversation.messages.findIndex(
          (it) => it.id === messageId,
        )
        if (findIndex === -1) {
          return
        }
        const index =
          conversation.messages[findIndex].from === 'user'
            ? findIndex + 1
            : findIndex
        deleteMessages = conversation.messages.slice(index).map((it) => it.id)
        conversation.messages = conversation.messages.slice(0, index)
      }),
    )
    await dbApi.messages.deleteBatch(deleteMessages)
  },
  deleteMessage: async (messageId: string) => {
    store.update((state) => ({
      ...state,
      conversations: state.conversations.map((it) => {
        if (it.id !== state.id) {
          return it
        }
        return {
          ...it,
          messages: it.messages.filter((message) => message.id !== messageId),
        }
      }),
    }))
    await dbApi.messages.delete(messageId)
  },
  delete: async (id: string) => {
    store.update((state) => {
      return {
        ...state,
        id: id === state.id ? '' : state.id,
        conversations: state.conversations.filter(
          (conversation) => conversation.id !== id,
        ),
      }
    })
    await dbApi.conversations.delete(id)
  },
  resetNewConv: () => {
    store.update((state) => ({
      ...state,
      newConv: false,
    }))
  },
  setCurrentId: (id: string) => {
    if (id === get(store).id) {
      return
    }
    store.update((state) => ({
      ...state,
      id,
    }))
  },
  async loadMessages(id: string) {
    const messages = sortBy(
      await Promise.all(
        (
          await dbApi.messages.getAll({
            conversationId: id,
            limit: 100,
          })
        ).data.map(async (it) => ({
          ...it,
          attachments: await Promise.all(
            it.attachments.map(async (atta) => {
              try {
                return {
                  ...atta,
                  url: await blobToDataURI(atta.data),
                }
              } catch (e) {
                return {
                  ...atta,
                  url: '',
                }
              }
            }),
          ),
        })),
      ),
      'createdAt',
    )
    store.update(
      produce((draft) => {
        const conv = draft.conversations.find((it) => it.id === id)
        if (!conv) {
          return
        }
        conv.messages = messages
      }),
    )
  },
  async updateModel(id: string, modelId: string) {
    store.update(
      produce((state) => {
        const conversation = state.conversations.find((it) => it.id === id)
        if (!conversation) {
          return
        }
        conversation.model = modelId
      }),
    )
    await dbApi.conversations.update({
      id,
      model: modelId,
      updatedAt: new Date().toISOString(),
    })
  },
}

// if (localStorage.getItem('conversations')) {
//   const conversations = JSON.parse(localStorage.getItem('conversations')!)
//   store.set({
//     ...get(store),
//     conversations,
//   })
// }
