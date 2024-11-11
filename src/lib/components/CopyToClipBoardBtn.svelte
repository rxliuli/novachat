<script lang="ts">
  import { onDestroy } from 'svelte'

  import { CopyIcon } from 'lucide-svelte'
  import * as Tooltip from './ui/tooltip'
  import { Button, buttonVariants } from './ui/button'
  import { cn } from '$lib/utils/ui'

  interface Props {
    value: string
    [key: string]: any
  }

  let { ...props }: Props = $props()

  let isSuccess = $state(false)
  let timeout: ReturnType<typeof setTimeout>

  const handleClick = async (ev: MouseEvent) => {
    ev.preventDefault()
    // writeText() can be unavailable or fail in some cases (iframe, etc) so we try/catch
    try {
      await navigator.clipboard.writeText(props.value)

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

<div class={props.class}>
  <Tooltip.Provider>
    <Tooltip.Root open={isSuccess}>
      <Tooltip.Trigger>
        <Button
          variant="ghost"
          size="icon"
          onclick={handleClick}
          class="border-none hover:bg-transparent {props.class}"
        >
          <CopyIcon class="w-4 h-4" />
        </Button>
      </Tooltip.Trigger>
      <Tooltip.Content>
        {#if isSuccess}
          <p>Copied</p>
        {/if}
      </Tooltip.Content>
    </Tooltip.Root>
  </Tooltip.Provider>
</div>
