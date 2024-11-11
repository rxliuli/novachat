<script lang="ts">
  import { Button } from '$lib/components/ui/button'
  import { Loader2Icon } from 'lucide-svelte'
  interface Props {
    onClick: () => Promise<void>;
    children?: import('svelte').Snippet;
  }

  let { onClick, children }: Props = $props();

  let loading = $state(false)

  async function handleClick() {
    try {
      loading = true
      await onClick()
    } finally {
      loading = false
    }
  }
</script>

<Button
  size="sm"
  on:click={(ev) => {
    ev.preventDefault()
    handleClick()
  }}
  disabled={loading}
>
  {#if loading}
    <Loader2Icon class="mr-1 w-4 h-4 animate-spin" />
  {/if}
  {@render children?.()}
</Button>
