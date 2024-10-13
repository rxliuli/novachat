<script lang="ts">
  import ChatWindow from '$lib/components/chat/ChatWindow.svelte'
  import { convStore } from '$lib/stores/converstation'
  import { settingsStore } from '$lib/stores/settings'
  import type { Message } from '$lib/types/Message'
  import { ChevronsUpDownIcon } from 'lucide-svelte'
  import { nanoid } from 'nanoid'
  import { push } from 'svelte-spa-router'
  import * as Command from '$lib/components/ui/command'
  import { pluginStore, type ActivatedModel } from '$lib/plugins/store'
  import { toast } from 'svelte-sonner'

  let loading = false
  let pending = false

  function handleMessage(msg: Pick<Message, 'content' | 'attachments'>) {
    const modelName = $settingsStore.defaultBot ?? $settingsStore.defaultModel
    if (!modelName) {
      toast.error('Please configure a model')
      return
    }
    pending = true
    console.log('msg', msg)
    const id = nanoid()
    convStore.create(id, modelName, {
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
