<script lang="ts">
  import { isDesktop } from '$lib/utils/isDesktop'
  import { onMount } from 'svelte'
  import type { FormEventHandler } from 'svelte/elements'

  interface Props {
    value?: string
    minRows?: number
    maxRows?: null | number
    placeholder?: string
    disabled?: boolean
    onInput?: FormEventHandler<HTMLTextAreaElement>
    onPaste?: (event: ClipboardEvent) => void
    onKeyDown?: (event: KeyboardEvent) => void
    onCompositionStart?: () => void
    onCompositionEnd?: () => void
  }

  let {
    value = $bindable(''),
    minRows = 1,
    maxRows = null,
    placeholder = '',
    disabled = false,
    onInput,
    onPaste,
    onKeyDown,
    onCompositionStart,
    onCompositionEnd,
  }: Props = $props()

  let textareaElement: HTMLTextAreaElement | undefined = $state()

  let minHeight = $derived(`${1 + minRows * 1.5}em`)
  let maxHeight = $derived(maxRows ? `${1 + maxRows * 1.5}em` : `auto`)

  onMount(() => {
    if (isDesktop(window)) {
      textareaElement?.focus()
    }
  })
</script>

<div class="relative min-w-0 flex-1" onpaste={onPaste}>
  <pre
    class="scrollbar-custom invisible overflow-x-hidden overflow-y-scroll whitespace-pre-wrap break-words p-3 bg-gray-100 dark:bg-gray-700"
    aria-hidden="true"
    style="min-height: {minHeight}; max-height: {maxHeight}">{(value || ' ') +
      '\n'}</pre>

  <textarea
    enterkeyhint="send"
    tabindex="0"
    rows="1"
    class="scrollbar-custom overflow-y-auto absolute top-0 m-0 h-full w-full resize-none scroll-p-3 overflow-x-hidden border-0 bg-transparent py-3 outline-none focus:ring-0 focus-visible:ring-0"
    class:text-gray-400={disabled}
    bind:value
    bind:this={textareaElement}
    {disabled}
    oninput={onInput}
    oncompositionstart={onCompositionStart}
    oncompositionend={onCompositionEnd}
    onkeydown={onKeyDown}
    onbeforeinput={onInput}
    {placeholder}
  ></textarea>
</div>

<style>
  pre,
  textarea {
    font-family: inherit;
    box-sizing: border-box;
    line-height: 1.5;
  }
</style>
