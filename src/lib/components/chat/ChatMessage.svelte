<script lang="ts">
  import type { Message } from '$lib/types/Message'
  import { BotIcon, UserIcon, TriangleAlertIcon } from 'lucide-svelte'
  import { fromMarkdown } from 'mdast-util-from-markdown'
  import { gfm } from 'micromark-extension-gfm'
  import { gfmFromMarkdown } from 'mdast-util-gfm'
  import { newlineToBreak } from 'mdast-util-newline-to-break'
  import type { Root } from 'mdast'
  import { createEventDispatcher } from 'svelte'
  import { Button } from '../ui/button'
  import { RotateCcwIcon, Trash2Icon } from 'lucide-svelte'
  import { cn } from '$lib/utils/ui'
  import CopyToClipBoardBtn from '../CopyToClipBoardBtn.svelte'
  import BotChatMessage from './BotChatMessage.svelte'
  export let message: Message
  import * as Alert from '$lib/components/ui/alert'

  export let loading: boolean

  const dispatch = createEventDispatcher<{
    retry: void
    delete: void
  }>()

  let root: Root
  $: if (message.from === 'assistant') {
    root = fromMarkdown(message.content, {
      extensions: [gfm()],
      mdastExtensions: [gfmFromMarkdown(), { transforms: [newlineToBreak] }],
    })
  }
</script>

<div
  class="flex p-4 group/message {message.from === 'assistant' &&
    'bg-gray-100 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-800'}"
  id="message-{message.from}-{message.id}"
>
  <div class="flex-none select-none rounded-full mr-3">
    {#if message.from === 'assistant'}
      <div
        class="w-6 h-6 bg-blue-500 dark:bg-blue-600 rounded-full flex items-center justify-center"
      >
        <BotIcon class="w-4 h-4 text-white" />
      </div>
    {/if}
    {#if message.from === 'user'}
      <div
        class="w-6 h-6 bg-purple-500 dark:bg-purple-600 rounded-full flex items-center justify-center"
      >
        <UserIcon class="w-4 h-4 text-white" />
      </div>
    {/if}
  </div>
  <div class="flex-grow">
    {#each message.attachments ?? [] as attachment}
      {#if attachment.url}
        <div class="overflow-hidden rounded-lg max-w-96 max-h-64 mb-2">
          <img src={attachment.url} alt="" class="w-full h-full object-cover" />
        </div>
      {:else}
        <Alert.Root variant="destructive" class="mb-2">
          <TriangleAlertIcon class="h-4 w-4" />
          <Alert.Title>Error</Alert.Title>
          <Alert.Description>Image load failed.</Alert.Description>
        </Alert.Root>
      {/if}
    {/each}
    {#if message.from === 'assistant'}
      <article
        class="prose dark:prose-invert max-sm:prose-sm max-w-none [&_p]:break-words [&_p]:break-all"
      >
        <BotChatMessage node={root} />
      </article>
      <div
        class="flex justify-end gap-1 md:group-hover/message:opacity-100 md:opacity-0 {cn(
          {
            hidden: loading,
          },
        )}"
      >
        <button on:click={() => dispatch('retry')} class="h-5 w-5">
          <RotateCcwIcon class="w-4 h-4" />
        </button>
        <CopyToClipBoardBtn value={message.content} class="h-5 w-5 " />
        <button on:click={() => dispatch('delete')} class="h-5 w-5">
          <Trash2Icon class="w-4 h-4" />
        </button>
      </div>
    {:else}
      <pre
        class="text-gray-700 dark:text-gray-300 text-wrap">{message.content.trim()}</pre>
      <div
        class="flex justify-end gap-1 md:group-hover/message:opacity-100 md:opacity-0 {cn(
          {
            hidden: loading,
          },
        )}"
      >
        <Button
          on:click={() => dispatch('retry')}
          variant={'ghost'}
          size={'icon'}
          class="h-5 w-5"
        >
          <RotateCcwIcon class="w-4 h-4" />
        </Button>
        <CopyToClipBoardBtn value={message.content} class="h-5 w-5 " />
        <Button
          on:click={() => dispatch('delete')}
          variant={'ghost'}
          size={'icon'}
          class="h-5 w-5"
        >
          <Trash2Icon class="w-4 h-4" />
        </Button>
      </div>
    {/if}
  </div>
</div>
