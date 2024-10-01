<script lang="ts">
  import { BotIcon, TrashIcon, PencilIcon } from 'lucide-svelte'
  import { createEventDispatcher } from 'svelte'
  import { Button } from './ui/button'
  import type { Conversation } from '$lib/types/Conversation'
  import { convStore } from '$lib/stores/converstation'
  import { cn } from '$lib/utils/ui'
  import { toggleMode } from 'mode-watcher'
  import { location } from 'svelte-spa-router'

  export let conversations: Conversation[]

  const dispatch = createEventDispatcher<{
    deleteConversation: string
    editCurrentConversation: {
      id: string
      title: string
    }
    hideSidebar: void
  }>()

  function updateTitle(ev: MouseEvent, it: Conversation) {
    ev.preventDefault()
    const title = prompt('Enter new title', it.title)
    if (title) {
      dispatch('editCurrentConversation', { id: it.id, title })
    }
  }

  function deleteConv(ev: MouseEvent, id: string) {
    ev.preventDefault()
    dispatch('deleteConversation', id)
  }

  const sidebarItemClsx = cn(
    'text-muted-foreground flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary hover:bg-accent',
  )
</script>

<div class="flex h-full max-h-screen flex-col gap-2 overflow-y-auto">
  <div class="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
    <a
      href="#/"
      class="flex items-center gap-2 font-semibold"
      on:click={() => dispatch('hideSidebar')}
    >
      <BotIcon class="h-6 w-6" />
      <span class="">NovaChat</span>
    </a>
    <a href="#/" class="ml-auto">
      <Button
        variant="outline"
        on:click={() => {
          convStore.setCurrentId('')
          dispatch('hideSidebar')
        }}
      >
        New Chat
      </Button>
    </a>
  </div>
  <div class="flex-1 overflow-y-auto">
    <div class="flex flex-col gap-2">
      <div class="flex flex-col gap-2 px-2 text-sm font-medium lg:px-4">
        {#each conversations as it}
          <a
            href={`#/conversation/${it.id}`}
            class={cn(sidebarItemClsx, 'group gap-1 justify-between', {
              'bg-accent text-primary': $location === `/conversation/${it.id}`,
            })}
            on:click={() => dispatch('hideSidebar')}
          >
            <span class="flex-1 mr-auto truncate">{it.title}</span>
            <Button
              variant="ghost"
              size="icon"
              on:click={(ev) => updateTitle(ev, it)}
              class="h-5 w-5 md:hidden md:group-hover:flex"
            >
              <PencilIcon class="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              on:click={(ev) => deleteConv(ev, it.id)}
              class="h-5 w-5 md:hidden md:group-hover:flex"
            >
              <TrashIcon class="h-4 w-4" />
            </Button>
          </a>
        {/each}
      </div>
    </div>
  </div>
  <div class="mt-auto px-1 py-2">
    <nav class="grid items-start px-2 text-sm font-medium lg:px-4">
      <a
        href="#/"
        on:click={(ev) => {
          ev.preventDefault()
          toggleMode()
        }}
        class={sidebarItemClsx}
      >
        Theme
      </a>
      <a
        href="#/models"
        class={sidebarItemClsx}
        on:click={() => dispatch('hideSidebar')}>Models</a
      >
      <a
        href="#/settings"
        class={sidebarItemClsx}
        on:click={() => dispatch('hideSidebar')}>Settings</a
      >
    </nav>
  </div>
</div>
