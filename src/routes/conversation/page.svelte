<script lang="ts">
  import { run } from 'svelte/legacy'

  import ChatWindow from '$lib/components/chat/ChatWindow.svelte'
  import { convStore } from '$lib/stores/converstation.svelte'
  import type { Message } from '$lib/types/Message'
  import { nanoid } from 'nanoid'
  import { bot } from '$lib/api/bot'
  import { toast } from 'svelte-sonner'
  import { generateTitleForConversation } from '$lib/service/textGeneration/title'
  import { Button } from '$lib/components/ui/button'
  import { CircleAlertIcon } from 'lucide-svelte'
  import { onDestroy, untrack } from 'svelte'
  import { type ActivatedModel } from '$lib/plugins/store'
  import { settingsStore } from '$lib/stores/settings'

  interface Props {
    params?: { id: string }
  }

  let { params = { id: '' } }: Props = $props()

  let conversation = $derived(
    $convStore.conversations.find((it) => it.id === params.id),
  )
  let messages = $derived(conversation?.messages ?? [])

  let old: string = params.id
  async function onNavigate(id: string) {
    console.log('setCurrentId', id, $convStore.id)
    if (id === $convStore.id) {
      return
    }
    if (id !== old) {
      abortController?.abort()
      old = id
    }
    if (id !== $convStore.id) {
      convStore.setCurrentId(id)
    }
    if (!messages.length) {
      await convStore.loadMessages(id)
    }
  }
  $effect(() => {
    if (params.id) {
      untrack(() => onNavigate(params.id))
    }
  })
  onDestroy(() => {
    onNavigate('')
  })

  let loading = $state(false)
  let pending = $state(false)
  let abortController: AbortController | null = null

  async function onSend() {
    if (!conversation || loading || pending) {
      return
    }
    pending = true
    convStore.resetNewConv()
    const message: Message = {
      id: nanoid(),
      content: '',
      from: 'assistant',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    abortController = new AbortController()
    const stream = bot.stream({
      messages: [...conversation.messages],
      controller: abortController,
      model: conversation.model,
    })
    await convStore.addMessage(conversation.id, message)
    let content = ''
    loading = true
    try {
      for await (const chunk of stream) {
        content = chunk.replace ? chunk.content : content + chunk.content
        await convStore.updateMessage(conversation.id, { ...message, content })
      }
    } catch (err) {
      console.error(err)
      toast.error('Failed to send message', {
        description: err instanceof Error ? err.message : 'Unknown error',
      })
    } finally {
      loading = false
      pending = false
      abortController = null
    }
  }

  async function onGenerateTitle() {
    if (!conversation) {
      return
    }
    if (!$settingsStore.defaultModel) {
      console.warn('No model name found')
      return
    }
    const title = await generateTitleForConversation({
      ...conversation,
      model: $settingsStore.defaultModel,
    })
    if (title) {
      convStore.updateTitle(conversation.id, title)
    }
  }

  $effect(() => {
    if ($convStore.newConv) {
      // Avoid automatic dependency tracking https://svelte.dev/docs/svelte/svelte#untrack
      untrack(() => {
        onGenerateTitle()
        onSend()
      })
    }
  })

  async function handleMessage(msg: Pick<Message, 'content' | 'attachments'>) {
    if (!conversation) {
      return
    }
    const message: Message = {
      id: nanoid(),
      ...msg,
      from: 'user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    await convStore.addMessage(conversation.id, message)
    await onSend()
  }

  function handleStop() {
    abortController?.abort()
  }

  async function handleRetry(id: string) {
    if (!conversation) {
      return
    }
    await convStore.retryMessage(id)
    await onSend()
  }

  async function handleDelete(ev: CustomEvent<{ id: string }>) {
    if (!conversation) {
      return
    }
    await convStore.deleteMessage(ev.detail.id)
  }
  function handleModelSelect(model: ActivatedModel) {
    if (!conversation) {
      return
    }
    convStore.updateModel(conversation.id, model.id)
  }
</script>

{#if conversation}
  <ChatWindow
    {messages}
    {loading}
    {pending}
    on:message={(e) => handleMessage(e.detail)}
    on:stop={handleStop}
    on:retry={(e) => handleRetry(e.detail.id)}
    on:delete={handleDelete}
    on:selectModel={(ev) => handleModelSelect(ev.detail)}
  />
{:else}
  <div class="flex flex-col items-center justify-center h-full text-center">
    <div class="flex items-center gap-2 text-yellow-500 mb-4">
      <CircleAlertIcon class="h-6 w-6" />
      <h2 class="text-xl font-semibold">No Active Conversation</h2>
    </div>
    <p class="text-gray-600 dark:text-gray-400 mb-6">
      It looks like you haven't selected or started a conversation yet.
    </p>
    <div class="flex gap-4">
      <a href="#/">
        <Button variant="default">Start New Chat</Button>
      </a>
    </div>
  </div>
{/if}
