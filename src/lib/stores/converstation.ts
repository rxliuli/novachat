import { dbApi } from '$lib/api/db'
import type { Conversation } from '$lib/types/Conversation'
import type { Attachment, Message } from '$lib/types/Message'
import { blobToDataURI } from '$lib/utils/datauri'
import { omit } from 'lodash-es'
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
        ...message,
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
        ...message,
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
      ...message,
      conversationId: id,
      updatedAt: new Date().toISOString(),
    })
  },
  retryMessage: async (messageId: string) => {
    let deleteMessages: Message[] = []
    store.update((state) => {
      return {
        ...state,
        conversations: state.conversations.map((conversation) => {
          if (conversation.id !== state.id) {
            return conversation
          }
          const findIndex = conversation.messages.findIndex(
            (it) => it.id === messageId,
          )
          if (findIndex === -1) {
            return conversation
          }
          const index =
            conversation.messages[findIndex].from === 'user'
              ? findIndex + 1
              : findIndex
          deleteMessages = conversation.messages.slice(index)
          return {
            ...conversation,
            messages: conversation.messages.slice(0, index),
          }
        }),
      }
    })
    await dbApi.messages.deleteBatch(deleteMessages.map((it) => it.id))
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
    const messages = await Promise.all(
      (
        await dbApi.messages.getAll({
          conversationId: id,
          limit: 100,
        })
      ).data.map(async (it) => ({
        ...it,
        attachments: await Promise.all(
          it.attachments.map(async (atta) => ({
            ...atta,
            url: await blobToDataURI(atta.data),
          })),
        ),
      })),
    )
    store.update((state) => {
      return {
        ...state,
        conversations: state.conversations.map((it) => {
          return it.id === id ? { ...it, messages } : it
        }),
      }
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
