<script lang="ts">
  import { Button } from '$lib/components/ui/button'
  import { Loader2Icon } from 'lucide-svelte'
  export let onClick: () => Promise<void>

  let loading = false

  async function handleClick() {
    try {
      loading = true
      await onClick()
    } finally {
      loading = false
    }
  }
</script>

<Button size="sm" on:click={() => handleClick()} disabled={loading}>
  {#if loading}
    <Loader2Icon class="mr-1 w-4 h-4 animate-spin" />
  {/if}
  <slot />
</Button>
