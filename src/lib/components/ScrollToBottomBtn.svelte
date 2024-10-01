<script lang="ts">
  import { fade } from 'svelte/transition'
  import { onDestroy } from 'svelte'
  import { ChevronDownIcon } from 'lucide-svelte'
  import { Button } from './ui/button'

  export let scrollNode: HTMLElement
  export { className as class }

  let visible = false
  let observer: ResizeObserver | null = null

  $: if (scrollNode) {
    destroy()

    if (window.ResizeObserver) {
      observer = new ResizeObserver(() => {
        updateVisibility()
      })
      observer.observe(scrollNode)
    }
    scrollNode.addEventListener('scroll', updateVisibility)
  }

  function updateVisibility() {
    if (!scrollNode) return
    visible =
      Math.ceil(scrollNode.scrollTop) + 200 <
      scrollNode.scrollHeight - scrollNode.clientHeight
  }

  function destroy() {
    observer?.disconnect()
    scrollNode?.removeEventListener('scroll', updateVisibility)
  }

  onDestroy(destroy)
</script>

<Button
  variant="ghost"
  size="icon"
  on:click={() =>
    scrollNode.scrollTo({ top: scrollNode.scrollHeight, behavior: 'smooth' })}
  class="btn absolute flex h-[41px] w-[41px] rounded-full border bg-white shadow-md transition-all hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:shadow-gray-950 dark:hover:bg-gray-600 {visible
    ? 'flex'
    : 'hidden'}  {$$props.class}"><ChevronDownIcon /></Button
>
