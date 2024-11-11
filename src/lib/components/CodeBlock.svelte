<!-- @migration-task Error while migrating Svelte code: Can't migrate code with afterUpdate. Please migrate by hand. -->
<script lang="ts">
  import CopyToClipBoardBtn from './CopyToClipBoardBtn.svelte'
  import { afterUpdate } from 'svelte'
  import type { Element } from 'hast'
  import { toHtml } from 'hast-util-to-html'

  export let node: Element

  let highlightedCode = ''
  let code = ''

  async function highlightCode() {
    if (node) {
      highlightedCode = toHtml(node)
      code = node.properties.code as string
    }
  }

  afterUpdate(highlightCode)
</script>

<div class="group/code-block relative grid grid-cols-1 rounded-lg">
  <div class="max-w-full overflow-x-auto">
    {@html highlightedCode}
  </div>
  <CopyToClipBoardBtn
    class="btn rounded-lg border absolute top-2 right-0 md:group-hover/code-block:opacity-100 md:opacity-0"
    value={code}
  />
</div>
