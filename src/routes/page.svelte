<script lang="ts">
  import ChatWindow from '$lib/components/chat/ChatWindow.svelte'
  import { convStore } from '$lib/stores/converstation'
  import { settingsStore } from '$lib/stores/settings'
  import type { Message } from '$lib/types/Message'
  import { nanoid } from 'nanoid'
  import { push } from 'svelte-spa-router'
  import { toast } from 'svelte-sonner'
  import { onMount } from 'svelte'
  import { pluginStore } from '$lib/plugins/store'

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

  onMount(() => {
    if ($pluginStore.plugins.length === 0) {
      toast.info('Please install a plugin', {
        action: {
          label: 'Install Plugin',
          onClick: () => push('/plugins'),
        },
      })
      return
    }
    if (!$settingsStore.defaultModel) {
      toast.info('Please configure a default model', {
        action: {
          label: 'Configure Model',
          onClick: () => push('/settings'),
        },
      })
      return
    }
  })
</script>

<ChatWindow
  messages={[]}
  {loading}
  {pending}
  on:message={(ev) => handleMessage(ev.detail)}
/>
