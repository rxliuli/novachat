<script lang="ts">
  import ChatInput from './ChatInput.svelte'
  import type { Attachment, Message } from '$lib/types/Message'
  import { createEventDispatcher } from 'svelte'
  import {
    SendIcon,
    LoaderCircleIcon,
    PauseIcon,
    LinkIcon,
    CircleXIcon,
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

  export let messages: Message[] = []
  export let loading = false
  export let pending = false
  let lastIsError = false
  let message: string
  let images: Attachment[] = []

  const dispatch = createEventDispatcher<{
    message: Pick<Message, 'content' | 'attachments'>
    stop: void
    retry: { id: Message['id'] }
    delete: { id: Message['id'] }
  }>()

  const handleSubmit = () => {
    if (loading) return
    if (!message.trim()) return
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

  let chatContainer: HTMLElement

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

  let isLightboxOpen = false
  let lightboxIndex = 0

  function openLightbox(index: number) {
    isLightboxOpen = true
    lightboxIndex = index
  }

  function closeLightbox() {
    isLightboxOpen = false
  }
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
  <div class="absolute bottom-0 left-0 right-0 flex justify-center px-3.5 py-4">
    <div class="w-full max-w-3xl">
      <div class="flex gap-2 justify-end items-center mb-2">
        {#if loading}
          <Button variant="outline" on:click={() => dispatch('stop')}>
            <PauseIcon class="w-4 h-4" />
            <span>Stop generating</span>
          </Button>
        {/if}
      </div>
      <form
        class="relative w-full flex-1 rounded-xl border bg-gray-100 focus-within:border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:focus-within:border-gray-500"
        on:submit|preventDefault={handleSubmit}
      >
        <div
          class="flex-1 overflow-x-auto flex gap-2 flex-nowrap px-12 py-2 {cn({
            hidden: images.length === 0,
          })}"
        >
          {#each images as image, index}
            <div class="flex-shrink-0 w-14 h-14 relative">
              <button
                class="w-full h-full"
                on:click={() => openLightbox(index)}
              >
                <img
                  src={image.url}
                  class="w-full h-full object-cover rounded-lg"
                  alt={image.name}
                />
              </button>
              <button
                class="absolute top-0 right-0"
                on:click={() => onDeleteImage(index)}
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
            on:click={onUploadImage}
          >
            <LinkIcon class="w-4 h-4" />
          </button>
          <ChatInput
            placeholder={'Ask anything'}
            bind:value={message}
            on:submit={handleSubmit}
            on:beforeinput={(ev) => {
              // if ($page.data.loginRequired) {
              //   ev.preventDefault()
              //   loginModalOpen = true
              // }
            }}
            on:paste={onPaste}
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
      <slot name="footer" />
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

<style>
  :global(.svelte-lightbox-body svg) {
    display: inline-block;
  }
</style>
