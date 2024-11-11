<script lang="ts">
  import BotChatMessage from './BotChatMessage.svelte';
  import CodeBlock from '../CodeBlock.svelte'
  import { toHtml } from 'hast-util-to-html'
  import type { Root } from 'hast'
  import SvgBlock from '../SvgBlock.svelte'

  interface Props {
    node: Root;
  }

  let { node }: Props = $props();
</script>

{#each node?.children ?? [] as it}
  {#if 'tagName' in it}
    {#if it.tagName === 'pre'}
      <CodeBlock node={it} />
    {:else if it.tagName === 'custom-svg'}
      <SvgBlock node={it} />
    {:else}
      <svelte:element this={it.tagName} {...it.properties}>
        <BotChatMessage node={it} />
      </svelte:element>
    {/if}
  {:else}
    {@html toHtml(it)}
  {/if}
{/each}
