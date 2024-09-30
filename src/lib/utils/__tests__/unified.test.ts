import { fromMarkdown } from 'mdast-util-from-markdown'
import { toHast } from 'mdast-util-to-hast'
import { toHtml } from 'hast-util-to-html'
import { gfm } from 'micromark-extension-gfm'
import { gfmFromMarkdown } from 'mdast-util-gfm'
import { newlineToBreak } from 'mdast-util-newline-to-break'
import { select } from 'unist-util-select'
import { visitParents } from 'unist-util-visit-parents'
import { expect, it } from 'vitest'
import type { Node, Element, Parent } from 'hast'
import { codeToHast } from 'shiki'

it('toHtml', () => {
  const md = 'Hello *world*'
  const result = toHtml(toHast(fromMarkdown(md)))
  expect(result.trim()).eq('<p>Hello <em>world</em></p>')
})

it('gfm', async () => {
  const md = `
| name | age |
| ---- | --- |
| Alice | 20 |
| Bob | 25 |
  `.trim()
  expect(select('table', fromMarkdown(md))).undefined
  const result = fromMarkdown(md, {
    extensions: [gfm()],
    mdastExtensions: [gfmFromMarkdown()],
  })
  expect(select('table', result)).not.undefined
})

it('breaks', async () => {
  const md = `
This is a
paragraph.
  `.trim()
  expect(select('break', fromMarkdown(md))).undefined
  const result = fromMarkdown(md, {
    mdastExtensions: [{ transforms: [newlineToBreak] }],
  })
  expect(select('break', result)).not.undefined
})

it('code', async () => {
  const md = `
\`\`\`json
{
  "name": "Alice",
  "age": 20
}
\`\`\`
  `
  const result = toHast(fromMarkdown(md))
  async function highlight(node: Node) {
    const promises: Promise<void>[] = []
    visitParents(
      node,
      (node) =>
        node.type === 'element' && 'tagName' in node && node.tagName === 'pre',
      (node, ancestors) => {
        const _node = (node as Element).children[0] as Element
        const lang = _node.properties.className!.toString()!.split('-')[1]
        promises.push(
          codeToHast(toHtml(_node), {
            lang,
            theme: 'github-dark',
          }).then((hast) => {
            const parent = ancestors[ancestors.length - 1] as Parent
            parent.children[parent.children.indexOf(node as Element)] = hast
              .children[0] as Element
          }),
        )
      },
    )
    await Promise.all(promises)
    return node
  }

  expect(toHtml(result)).not.include('shiki')
  await highlight(result)
  expect(toHtml(result)).include('shiki')
})
