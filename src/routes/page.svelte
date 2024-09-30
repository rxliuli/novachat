<script lang="ts">
  import ChatWindow from '$lib/components/chat/ChatWindow.svelte'
  import { convStore } from '$lib/stores/converstation'
  import { settingsStore } from '$lib/stores/settings'
  import type { Attachment, Message } from '$lib/types/Message'
  import { nanoid } from 'nanoid'
  import { push } from 'svelte-spa-router'

  let loading = false
  let pending = false

  function handleMessage(msg: Pick<Message, 'content' | 'attachments'>) {
    pending = true
    console.log('msg', msg)
    const id = nanoid()
    convStore.create(id, $settingsStore.defaultModel ?? 'gpt-4o', {
      id: nanoid(),
      ...msg,
      from: 'user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    push(`/conversation/${id}`)
  }

  function handleStop() {
    console.log('stop')
  }

  function handleRetry(ev: CustomEvent<{ id: string; content?: string }>) {
    console.log('retry', ev)
  }
</script>

<ChatWindow
  messages={[]}
  {loading}
  {pending}
  on:message={(ev) => handleMessage(ev.detail)}
  on:stop={handleStop}
  on:retry={handleRetry}
/>
