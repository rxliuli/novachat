<script lang="ts">
  import { onDestroy } from 'svelte'

  import { CopyIcon } from 'lucide-svelte'
  import * as Tooltip from './ui/tooltip'
  import { Button } from './ui/button'

  export let value: string

  let isSuccess = false
  let timeout: ReturnType<typeof setTimeout>

  const handleClick = async (ev: MouseEvent) => {
    ev.preventDefault()
    // writeText() can be unavailable or fail in some cases (iframe, etc) so we try/catch
    try {
      await navigator.clipboard.writeText(value)

      isSuccess = true
      if (timeout) {
        clearTimeout(timeout)
      }
      timeout = setTimeout(() => {
        isSuccess = false
      }, 1000)
    } catch (err) {
      console.error(err)
    }
  }

  onDestroy(() => {
    if (timeout) {
      clearTimeout(timeout)
    }
  })
</script>

<div class={$$props.class}>
  <Tooltip.Root open={isSuccess}>
    <Tooltip.Trigger asChild let:builder>
      <Button
        builders={[builder]}
        variant="ghost"
        size="icon"
        on:click={handleClick}
        class="border-none hover:bg-transparent {$$props.class}"
      >
        <CopyIcon class="w-4 h-4" />
      </Button>
    </Tooltip.Trigger>
    {#if isSuccess}
      <Tooltip.Content>
        <p>Copied</p>
      </Tooltip.Content>
    {/if}
  </Tooltip.Root>
</div>
