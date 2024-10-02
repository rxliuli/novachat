<script lang="ts">
  import CopyToClipBoardBtn from './CopyToClipBoardBtn.svelte'
  import { afterUpdate } from 'svelte'
  import { highlight } from '$lib/utils/highlight'

  export let code = ''
  export let lang = ''

  let highlightedCode = ''

  async function highlightCode() {
    if (code) {
      highlightedCode = await highlight(code, lang)
    }
  }

  afterUpdate(highlightCode)
</script>

<div class="group/code-block relative grid grid-cols-1 rounded-lg">
  <div class="max-w-full overflow-x-auto">
    {@html highlightedCode}
  </div>
  <CopyToClipBoardBtn
    class="btn rounded-lg border absolute top-2 right-0 group-hover/code-block:opacity-100 opacity-0"
    value={code}
  />
</div>
