<script lang="ts">
  import { run } from 'svelte/legacy';

  import { convStore } from '$lib/stores/converstation.svelte'
  import { push } from 'svelte-spa-router'
  import NavMenu from './NavMenu.svelte'
  import MobileNav from './MobileNav.svelte'
  import { location } from 'svelte-spa-router'
  import { sortBy } from 'lodash-es'
  interface Props {
    children?: import('svelte').Snippet;
  }

  let { children }: Props = $props();

  function deleteConv(id: string) {
    const old = $convStore.id
    convStore.delete(id)
    if (id === old) {
      push('/')
    }
  }

  let conversations = $derived(sortBy(
    $convStore.conversations,
    (it) => -new Date(it.updatedAt).getTime(),
  ))
  let isNavOpen = $state(false)
  let mobileNavTitle = $state('New Chat')
  run(() => {
    if ($location === `/conversation/${$convStore.id}`) {
      mobileNavTitle =
        $convStore.conversations.find((it) => it.id === $convStore.id)?.title ??
        'New Chat'
    } else if ($location === '/') {
      mobileNavTitle = 'New Chat'
    } else {
      mobileNavTitle = ''
    }
  });
</script>

<svelte:head>
  <title>{mobileNavTitle || 'NovaChat'}</title>
</svelte:head>

<div
  class="grid min-h-dvh w-full h-full grid-cols-1 grid-rows-[auto_1fr] overflow-hidden md:grid-rows-1 md:grid-cols-[280px_1fr] lg:grid-cols-[280px_1fr] dark:bg-gray-900"
>
  <MobileNav
    title={mobileNavTitle}
    isOpen={isNavOpen}
    on:toggle={(ev) => (isNavOpen = ev.detail)}
  >
    <NavMenu
      {conversations}
      on:deleteConversation={(ev) => deleteConv(ev.detail)}
      on:editCurrentConversation={(ev) =>
        convStore.updateTitle(ev.detail.id, ev.detail.title)}
      on:hideSidebar={() => (isNavOpen = false)}
    />
  </MobileNav>
  <div class="bg-muted/40 hidden border-r md:block">
    <NavMenu
      {conversations}
      on:deleteConversation={(ev) => deleteConv(ev.detail)}
      on:editCurrentConversation={(ev) =>
        convStore.updateTitle(ev.detail.id, ev.detail.title)}
    />
  </div>
  <div class="h-full overflow-auto">
    {@render children?.()}
  </div>
</div>
