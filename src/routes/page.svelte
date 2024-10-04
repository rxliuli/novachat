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

  let toggleModel = false
  function handleModelChange() {
    toggleModel = !toggleModel
  }

  function handleModelSelect(model: ActivatedModel) {
    console.log('model select', model)
    $settingsStore.defaultBot = model.id
    toggleModel = false
    console.log('defaultBot', $settingsStore.defaultBot)
  }

  function getDefaultBotName() {
    const modelName = $settingsStore.defaultBot ?? $settingsStore.defaultModel
    if (!modelName) {
      return
    }
    const model = $pluginStore.models.find((it) => it.id === modelName)
    return model?.name ?? modelName
  }

  let defaultBotName: string | undefined
  $: if ($settingsStore && $pluginStore) {
    defaultBotName = getDefaultBotName()
  }
</script>

<ChatWindow
  messages={[]}
  {loading}
  {pending}
  on:message={(ev) => handleMessage(ev.detail)}
  on:stop={handleStop}
  on:retry={handleRetry}
>
  <div slot="footer" class="py-2">
    <div class="flex text-sm items-center gap-2 text-gray-400/90">
      <span>Model: </span>
      <button class="flex items-center gap-1" on:click={handleModelChange}>
        {defaultBotName ?? 'Select a model'}
        <ChevronsUpDownIcon class="w-4 h-4" />
      </button>
    </div>
  </div>
</ChatWindow>

<Command.Dialog bind:open={toggleModel}>
  <Command.Input placeholder="Select a model..." />
  <Command.List>
    <Command.Empty>No results found.</Command.Empty>
    {#each $pluginStore.models as model}
      <Command.Item onSelect={() => handleModelSelect(model)}>
        <span>{model.name}</span>
      </Command.Item>
    {/each}
  </Command.List>
</Command.Dialog>
