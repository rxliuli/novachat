import type { Conversation } from '$lib/types/Conversation'
import type { Message } from '$lib/types/Message'
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
  create: (id: string, model: string, firstMessage: Message) => {
    store.update((state) => ({
      ...state,
      id: id,
      conversations: [
        ...state.conversations,
        {
          id,
          messages: [firstMessage],
          title: 'New Chat',
          model,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      newConv: true,
    }))
  },
  updateTitle: (id: string, title: string) => {
    store.update((state) => ({
      ...state,
      conversations: state.conversations.map((conversation) =>
        conversation.id === id
          ? { ...conversation, title, updatedAt: new Date().toISOString() }
          : conversation,
      ),
    }))
  },
  updateMessages: (id: string, messages: Message[]) => {
    store.update((state) => ({
      ...state,
      conversations: state.conversations.map((conversation) =>
        conversation.id === id
          ? { ...conversation, messages, updatedAt: new Date().toISOString() }
          : conversation,
      ),
    }))
  },
  deleteMessage: (messageId: string) => {
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
  },
  delete: (id: string) => {
    store.update((state) => {
      return {
        ...state,
        id: id === state.id ? '' : state.id,
        conversations: state.conversations.filter(
          (conversation) => conversation.id !== id,
        ),
      }
    })
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
}

if (localStorage.getItem('conversations')) {
  const conversations = JSON.parse(localStorage.getItem('conversations')!)
  store.set({
    ...get(store),
    conversations,
  })
}

store.subscribe((state) => {
  localStorage.setItem('conversations', JSON.stringify(state.conversations))
  console.log(state.id, state.conversations)
})
