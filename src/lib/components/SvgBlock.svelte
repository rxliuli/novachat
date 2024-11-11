<script lang="ts">
  import type { Element } from 'hast'
  import { Button } from './ui/button'
  import { DownloadIcon } from 'lucide-svelte'

  interface Props {
    node: Element;
  }

  let { node }: Props = $props();

  let svg = $derived(node.properties.value as string)

  function handleClick() {
    const blob = new Blob([svg], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'download.svg'
    a.click()
  }
</script>

<div class="w-fit relative">
  {@html svg}

  <Button
    variant="ghost"
    size="icon"
    on:click={handleClick}
    class="border-none bg-primary-foreground absolute top-2 right-2"
  >
    <DownloadIcon class="w-4 h-4" />
  </Button>
</div>
