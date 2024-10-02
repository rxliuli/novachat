<script lang="ts">
  import type { Root, Parent } from 'mdast'
  import CodeBlock from '../CodeBlock.svelte'
  import { select } from 'unist-util-select'
  import { toHtml } from 'hast-util-to-html'
  import { toHast } from 'mdast-util-to-hast'

  export let node: Root | Parent

  console.log('node', node)
</script>

{#each node.children as it}
  {#if it.type === 'code'}
    <CodeBlock code={it.value} lang={it.lang ?? ''} />
  {:else if select('code', it)}
    <svelte:self node={it} />
  {:else}
    {@html toHtml(toHast(it))}
  {/if}
{/each}
