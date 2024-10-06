<script lang="ts">
  import { Button } from '$lib/components/ui/button'
  import { Loader2Icon } from 'lucide-svelte'
  export let onInstall: () => Promise<void>

  let loading = false

  async function onInstallPlugin() {
    try {
      loading = true
      await new Promise((resolve) => setTimeout(resolve, 3000))
      await onInstall()
    } finally {
      loading = false
    }
  }
</script>

<Button on:click={() => onInstallPlugin()} disabled={loading}>
  {#if loading}
    <Loader2Icon class="mr-1 w-4 h-4 animate-spin" />
  {/if}
  Install
</Button>
