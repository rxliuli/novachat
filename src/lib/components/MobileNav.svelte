<script lang="ts">
  import { run } from 'svelte/legacy';

  import { createEventDispatcher } from 'svelte'
  import { SquarePenIcon, XIcon, MenuIcon } from 'lucide-svelte'
  import { convStore } from '$lib/stores/converstation.svelte'
  import { location } from 'svelte-spa-router'

  interface Props {
    isOpen?: boolean;
    title: string | undefined;
    children?: import('svelte').Snippet;
  }

  let { isOpen = false, title = $bindable(), children }: Props = $props();

  run(() => {
    title = title ?? 'New Chat'
  });

  let closeEl: HTMLButtonElement = $state()
  let openEl: HTMLButtonElement = $state()

  const dispatch = createEventDispatcher<{
    toggle: boolean
  }>()

  run(() => {
    if (isOpen && closeEl) {
      closeEl.focus()
    } else if (!isOpen && document.activeElement === closeEl) {
      openEl.focus()
    }
  });
</script>

<nav
  class="flex h-12 items-center justify-between border-b bg-gray-50 px-3 dark:border-gray-800 dark:bg-gray-800/70 md:hidden"
>
  <button
    type="button"
    class="-ml-3 flex size-12 shrink-0 items-center justify-center text-lg"
    onclick={() => dispatch('toggle', true)}
    aria-label="Open menu"
    bind:this={openEl}><MenuIcon /></button
  >
  <span class="truncate px-4">{title}</span>
  <a
    class:invisible={!$location.startsWith('/conversation/')}
    href="#/"
    class="-mr-3 flex size-12 shrink-0 items-center justify-center text-lg"
  >
    <SquarePenIcon />
  </a>
</nav>
<nav
  class="fixed inset-0 z-30 grid max-h-dvh h-full grid-cols-1 grid-rows-[auto,auto,1fr,auto] bg-white dark:bg-gray-900 {isOpen
    ? 'block'
    : 'hidden'}"
>
  <div class="flex h-12 items-center px-4">
    <button
      type="button"
      class="-mr-3 ml-auto flex size-12 items-center justify-center text-lg"
      onclick={() => dispatch('toggle', false)}
      aria-label="Close menu"
      bind:this={closeEl}><XIcon /></button
    >
  </div>
  {@render children?.()}
</nav>
