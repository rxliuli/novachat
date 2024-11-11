<script lang="ts">
  import { run } from 'svelte/legacy'

  import { onDestroy } from 'svelte'
  import { ChevronDownIcon } from 'lucide-svelte'
  import { Button } from './ui/button'

  interface Props {
    scrollNode: HTMLElement
    [key: string]: any
  }

  let { ...props }: Props = $props()

  let visible = $state(false)
  let observer: ResizeObserver | null = $state(null)

  function updateVisibility() {
    if (!props.scrollNode) return
    visible =
      Math.ceil(props.scrollNode.scrollTop) + 200 <
      props.scrollNode.scrollHeight - props.scrollNode.clientHeight
  }

  function destroy() {
    observer?.disconnect()
    props.scrollNode?.removeEventListener('scroll', updateVisibility)
  }

  onDestroy(destroy)

  function init() {
    destroy()
    if (window.ResizeObserver) {
      observer = new ResizeObserver(() => {
        updateVisibility()
      })
      observer.observe(props.scrollNode)
    }
    props.scrollNode.addEventListener('scroll', updateVisibility)
  }

  $effect(() => {
    if (props.scrollNode) {
      Promise.resolve().then(init)
    }
  })
</script>

<Button
  variant="ghost"
  size="icon"
  on:click={() =>
    props.scrollNode.scrollTo({
      top: props.scrollNode.scrollHeight,
      behavior: 'smooth',
    })}
  class="btn absolute flex h-[41px] w-[41px] rounded-full border bg-white shadow-md transition-all hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:shadow-gray-950 dark:hover:bg-gray-600 {visible
    ? 'flex'
    : 'hidden'}  {props.class}"><ChevronDownIcon /></Button
>
