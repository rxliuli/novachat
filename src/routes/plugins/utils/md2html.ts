import { toHtml } from 'hast-util-to-html'
import { fromMarkdown } from 'mdast-util-from-markdown'
import { gfmFromMarkdown } from 'mdast-util-gfm'
import { newlineToBreak } from 'mdast-util-newline-to-break'
import { toHast } from 'mdast-util-to-hast'
import { gfm } from 'micromark-extension-gfm'
import { type Highlighter } from 'shiki'
import type { Code } from 'mdast'
import type { Element } from 'hast'

export function md2html(md: string, highlighter: Highlighter) {
  const root = fromMarkdown(md, {
    extensions: [gfm()],
    mdastExtensions: [gfmFromMarkdown(), { transforms: [newlineToBreak] }],
  })
  const hast = toHast(root, {
    handlers: {
      code: (_state, node, _parent) => {
        const code = node as Code
        const lang = code.lang
        const value = code.value
        const hast = highlighter.codeToHast(value, {
          lang: lang!,
          themes: {
            light: 'github-light',
            dark: 'github-dark',
          },
        })
        return [hast.children[0] as Element]
      },
    },
  })
  return toHtml(hast)
}
