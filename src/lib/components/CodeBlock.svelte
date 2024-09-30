<script lang="ts">
  import CopyToClipBoardBtn from './CopyToClipBoardBtn.svelte'
  import { mode } from 'mode-watcher'
  import { toHtml } from 'hast-util-to-html'
  import { select } from 'unist-util-select'
  import type { Element } from 'hast'
  import { afterUpdate } from 'svelte'

  export let code = ''
  export let lang = ''

  let highlightedCode = ''
  let classNames = ''
  let style = ''

  async function highlightCode() {
    if (code) {
      const { codeToHast } = await import('shiki')
      const hast = await codeToHast(code, {
        lang,
        theme: $mode === 'dark' ? 'github-dark' : 'github-light',
        structure: 'classic',
      })
      const pre = select('element[tagName="pre"]', hast) as Element
      classNames = pre.properties.class?.toString() || ''
      style = pre.properties.style?.toString() || ''
      const codeElement = select('element[tagName="code"]', hast)
      if (codeElement && 'children' in codeElement) {
        highlightedCode = toHtml(codeElement.children as Element[])
      } else {
        highlightedCode = ''
      }
    }
  }

  afterUpdate(highlightCode)
</script>

<div class="group/code-block relative grid grid-cols-1 rounded-lg">
  <div class="max-w-full overflow-x-auto">
    <pre
      class="scrollbar-custom px-5 my-0 scrollbar-thumb-gray-500 hover:scrollbar-thumb-gray-400 dark:scrollbar-thumb-white/10 dark:hover:scrollbar-thumb-white/20 {classNames}"
      {style}><code class="language-{lang}">{@html highlightedCode}</code></pre>
  </div>
  <CopyToClipBoardBtn
    class="btn rounded-lg border absolute top-2 right-2 group-hover/code-block:opacity-100 opacity-0"
    value={code}
  />
</div>
