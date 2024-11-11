<script lang="ts">
  import { run, preventDefault } from 'svelte/legacy'

  import ChatInput from './ChatInput.svelte'
  import type { Attachment, Message } from '$lib/types/Message'
  import { createEventDispatcher } from 'svelte'
  import {
    SendIcon,
    LoaderCircleIcon,
    PauseIcon,
    LinkIcon,
    CircleXIcon,
    ChevronsUpDownIcon,
  } from 'lucide-svelte'
  import Button from '$lib/components/ui/button/button.svelte'
  import ChatMessage from './ChatMessage.svelte'
  import ScrollToBottomBtn from '../ScrollToBottomBtn.svelte'
  import { snapScrollToBottom } from '$lib/actions/snapScrollToBottom'
  import { optimizeImage } from '$lib/utils/optimizeImage'
  import { fileSelector } from '$lib/utils/fileSelector'
  import { cn } from '$lib/utils/ui'
  import { dataURItoBlob } from '$lib/utils/datauri'
  import { nanoid } from 'nanoid'
  import { LightboxGallery, GalleryImage } from 'svelte-lightbox'
  import { pluginStore, type ActivatedModel } from '$lib/plugins/store'
  import { isDesktop } from '$lib/utils/isDesktop'
  import { settingsStore } from '$lib/stores/settings'
  import { toast } from 'svelte-sonner'
  import * as Command from '../ui/command'
  import { convStore } from '$lib/stores/converstation.svelte'

  interface Props {
    messages?: Message[]
    loading?: boolean
    pending?: boolean
  }

  let { messages = [], loading = false, pending = false }: Props = $props()
  let lastIsError = false
  let message: string = $state('')
  let images: Attachment[] = $state([])

  const dispatch = createEventDispatcher<{
    message: Pick<Message, 'content' | 'attachments'>
    stop: void
    retry: { id: Message['id'] }
    delete: { id: Message['id'] }
    selectModel: ActivatedModel
  }>()

  const handleSubmit = () => {
    if (loading || pending || !message.trim()) {
      return
    }
    dispatch('message', {
      content: message.trim(),
      attachments: images,
    })
    message = ''
    images = []
  }

  const onPaste = async (e: ClipboardEvent) => {
    if (!e.clipboardData) {
      return
    }

    // paste of files
    const pastedFiles = Array.from(e.clipboardData.files)
    if (pastedFiles.length !== 0) {
      e.preventDefault()

      const filteredFiles = pastedFiles.filter((it) =>
        ['image/png', 'image/jpeg'].includes(it.type),
      )
      if (filteredFiles.length === 0) {
        return
      }

      await addImage(filteredFiles)
    }
  }

  let chatContainer: HTMLElement | undefined = $state()

  async function addImage(files: File[]) {
    const optimizedImages = await Promise.all(
      files.map(async (it) => {
        const buffer = await it.arrayBuffer()
        const optimizedImage = await optimizeImage(buffer)
        return {
          data: await dataURItoBlob(optimizedImage),
          name: it.name,
          type: 'image/jpeg',
          id: nanoid(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          url: optimizedImage,
        } satisfies Attachment
      }),
    )
    images = [...images, ...optimizedImages]
  }

  async function onUploadImage() {
    const files = await fileSelector({
      accept: 'image/png, image/jpeg',
      multiple: true,
    })
    if (!files) {
      return
    }
    await addImage([...files])
  }

  const onDeleteImage = (index: number) => {
    images = images.filter((_, i) => i !== index)
  }

  let isLightboxOpen = $state(false)
  let lightboxIndex = $state(0)

  function openLightbox(index: number) {
    isLightboxOpen = true
    lightboxIndex = index
  }

  let filteredModels: ActivatedModel[] = $state([])
  let selectedModelIndex = $state(-1)
  let showModelList = $state(false)
  let modelListContainer: HTMLElement | undefined = $state()
  let isCompositionOn = $state(false)

  const handleInput = (event: Event) => {
    const target = event.target as HTMLTextAreaElement
    message = target.value

    if (message.startsWith('@')) {
      const query = message.slice(1).toLowerCase()
      filteredModels = $pluginStore.models.filter((model) =>
        model.name.toLowerCase().includes(query),
      )
      showModelList = filteredModels.length > 0
      selectedModelIndex = 0
    } else {
      showModelList = false
      selectedModelIndex = -1
    }
  }

  const handleKeydown = (event: KeyboardEvent) => {
    if (showModelList) {
      if (event.key === 'ArrowUp') {
        event.preventDefault()
        selectedModelIndex =
          (selectedModelIndex - 1 + filteredModels.length) %
          filteredModels.length
        modelListContainer?.children[selectedModelIndex].scrollIntoView({
          block: 'nearest',
        })
      } else if (event.key === 'ArrowDown') {
        event.preventDefault()
        selectedModelIndex = (selectedModelIndex + 1) % filteredModels.length
        modelListContainer?.children[selectedModelIndex].scrollIntoView({
          block: 'nearest',
        })
      } else if (event.key === 'Enter') {
        event.preventDefault()
        selectModel(filteredModels[selectedModelIndex])
      } else if (event.key === 'Escape') {
        // showModelList = false
      }
    } else if (
      event.key === 'Enter' &&
      !event.shiftKey &&
      !isCompositionOn &&
      isDesktop(window)
    ) {
      event.preventDefault()
      handleSubmit()
    }
  }

  const selectModel = (model: ActivatedModel) => {
    handleModelSelect(model)
    message = ''
    showModelList = false
  }

  let toggleModel = $state(false)
  function handleModelChange() {
    toggleModel = !toggleModel
  }

  function handleModelSelect(selectedModel: ActivatedModel) {
    $settingsStore.defaultBot = selectedModel.id
    dispatch('selectModel', selectedModel)
    toast.success(`Selected model: ${selectedModel.name}`)
    toggleModel = false
    setTimeout(() => {
      ;(document.querySelector('#chat-input') as HTMLTextAreaElement)?.focus()
    }, 100)
  }

  function getDefaultBotName() {
    if ($convStore.id) {
      const conversation = $convStore.conversations.find(
        (it) => it.id === $convStore.id,
      )
      if (conversation) {
        return conversation.model
      }
    }
    const modelName = $settingsStore.defaultBot ?? $settingsStore.defaultModel
    if (!modelName) {
      return
    }
    const model = $pluginStore.models.find((it) => it.id === modelName)
    return model?.name ?? modelName
  }

  let defaultBotName: string | undefined = $state()
  run(() => {
    if ($settingsStore && $pluginStore) {
      defaultBotName = getDefaultBotName()
    }
  })
</script>

<div class="relative h-full">
  <div
    class="h-full overflow-y-auto p-2"
    use:snapScrollToBottom={messages.length ? [...messages] : false}
    bind:this={chatContainer}
  >
    <div class="max-w-3xl mx-auto flex flex-col gap-2 pt-2 pb-36">
      {#each messages as message}
        <ChatMessage
          {message}
          {loading}
          on:retry={() => dispatch('retry', { id: message.id })}
          on:delete={() => dispatch('delete', { id: message.id })}
        />
      {/each}
    </div>
    <ScrollToBottomBtn
      class="fixed right-4 max-md:bottom-[calc(50%-26px)] md:bottom-36 lg:right-10"
      scrollNode={chatContainer}
    />
  </div>
  <div
    class="absolute bottom-0 left-0 right-0 flex justify-center px-3.5 py-4 bg-gradient-to-t from-gray-900 via-gray-900/80 to-transparent"
  >
    <div class="w-full max-w-3xl">
      <div class="flex gap-2 justify-end items-center mb-2">
        {#if loading}
          <Button variant="outline" onclick={() => dispatch('stop')}>
            <PauseIcon class="w-4 h-4" />
            <span>Stop generating</span>
          </Button>
        {/if}
      </div>
      <div
        class="max-h-48 overflow-y-auto bg-popover rounded-md mb-2 {!showModelList &&
          'hidden'}"
        bind:this={modelListContainer}
      >
        {#each filteredModels as model, index}
          <button
            class="block w-full text-left p-2 rounded-md {selectedModelIndex ===
              index && 'bg-accent'}"
            onmouseover={() => (selectedModelIndex = index)}
            onfocus={() => (selectedModelIndex = index)}
            onclick={() => selectModel(model)}
          >
            {model.name}
          </button>
        {/each}
      </div>
      <form
        class="relative w-full flex-1 rounded-xl border bg-gray-100 focus-within:border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:focus-within:border-gray-500"
        onsubmit={preventDefault(handleSubmit)}
      >
        <div
          class="flex-1 overflow-x-auto flex gap-2 flex-nowrap px-12 py-2 {cn({
            hidden: images.length === 0,
          })}"
        >
          {#each images as image, index}
            <div class="flex-shrink-0 w-14 h-14 relative">
              <button class="w-full h-full" onclick={() => openLightbox(index)}>
                <img
                  src={image.url}
                  class="w-full h-full object-cover rounded-lg"
                  alt={image.name}
                />
              </button>
              <button
                class="absolute top-0 right-0"
                onclick={() => onDeleteImage(index)}
              >
                <CircleXIcon
                  class="w-6 h-6 rounded-full text-gray-50 hover:text-gray-400"
                />
              </button>
            </div>
          {/each}
        </div>
        <div class="flex w-full flex-1 border-none bg-transparent">
          <button
            class="btn mx-1 my-1 h-[2.4rem] self-end rounded-lg bg-transparent p-1 px-[0.7rem] text-gray-400 enabled:hover:text-gray-700 disabled:opacity-60 enabled:dark:hover:text-gray-100 dark:disabled:opacity-40"
            disabled={pending}
            type="button"
            onclick={onUploadImage}
          >
            <LinkIcon class="w-4 h-4" />
          </button>
          <ChatInput
            placeholder={'Ask anything'}
            bind:value={message}
            onPaste={onPaste}
            onInput={handleInput}
            onKeyDown={handleKeydown}
            onCompositionStart={() => (isCompositionOn = true)}
            onCompositionEnd={() => (isCompositionOn = false)}
            maxRows={6}
            disabled={lastIsError}
          />

          {#if loading}
            <div
              class="mx-1 my-1 hidden h-[2.4rem] items-center p-1 px-[0.7rem] text-gray-400 enabled:hover:text-gray-700 disabled:opacity-60 enabled:dark:hover:text-gray-100 dark:disabled:opacity-40 md:flex"
            >
              <LoaderCircleIcon class="w-4 h-4" />
            </div>
          {:else}
            <button
              class="btn mx-1 my-1 h-[2.4rem] self-end rounded-lg bg-transparent p-1 px-[0.7rem] text-gray-400 enabled:hover:text-gray-700 disabled:opacity-60 enabled:dark:hover:text-gray-100 dark:disabled:opacity-40"
              disabled={!message || !message.trim() || pending}
              type="submit"
            >
              <SendIcon class="w-4 h-4" />
            </button>
          {/if}
        </div>
      </form>
      <div class="py-2">
        <div class="flex text-sm items-center gap-2 text-gray-400/90">
          <span>Model: </span>
          <button class="flex items-center gap-1" onclick={handleModelChange}>
            {defaultBotName ?? 'Select a model'}
            <ChevronsUpDownIcon class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  </div>
</div>

<LightboxGallery bind:isVisible={isLightboxOpen} activeImage={lightboxIndex}>
  {#each images as image}
    <GalleryImage>
      <img src={image.url} alt={image.name} />
    </GalleryImage>
  {/each}
</LightboxGallery>

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

<style>
  :global(.svelte-lightbox-body svg) {
    display: inline-block;
  }
</style>
