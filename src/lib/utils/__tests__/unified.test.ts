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
import { codeToHast, createHighlighter } from 'shiki'
import { hastShiki } from '$lib/utils/md2html'
import { mdxJsxFromMarkdown } from 'mdast-util-mdx-jsx'
import { mdxJsx } from 'micromark-extension-mdx-jsx'
import { toString } from 'mdast-util-to-string'

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

it('md2hast and include code', async () => {
  const md = `
\`\`\`json
{
  "name": "Alice",
  "age": 20
}
\`\`\`
  `.trim()
  const highlighter = await createHighlighter({
    themes: ['github-light', 'github-dark'],
    langs: ['typescript', 'javascript', 'json'],
  })
  const result = toHast(fromMarkdown(md), {
    handlers: {
      code: hastShiki(highlighter),
    },
  })
  expect(select('[tagName="pre"]', result)).not.undefined
  expect(toHtml(result)).include('shiki')
})

it.skip('render svg', () => {
  const md = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600">
    <!-- 背景 -->
    <rect width="400" height="600" fill="#FFFBF5"/>
    
    <!-- 装饰几何图形 -->
    <rect x="20" y="20" width="360" height="560" fill="none" stroke="#D4A373" stroke-width="1"/>
    <line x1="40" y1="100" x2="360" y2="100" stroke="#D4A373" stroke-width="0.5"/>
</svg>
  `
  const root = fromMarkdown(md, {
    extensions: [mdxJsx()],
    mdastExtensions: [
      mdxJsxFromMarkdown(),
      {
        transforms: [
          (root) => {
            visitParents(root, 'mdxJsxFlowElement', (node, ancestors) => {
              if (node.name !== 'svg') {
                return
              }
              const parent = ancestors[ancestors.length - 1]
              parent.children[parent.children.indexOf(node as any)] = {
                type: 'html',
                value: `<svg ${node.attributes
                  .map((it) => `${(it as any).name}="${it.value}"`)
                  .join(' ')}>${toString(node, {
                  includeHtml: true,
                })}</svg>`,
              }
            })
          },
        ],
      },
    ],
  })
  console.log(
    toHtml(toHast(root, { allowDangerousHtml: true }), {
      allowDangerousHtml: true,
    }),
  )
  // console.log(
  //   inspect(
  //     raw(
  //       toHast(fromMarkdown(md), {
  //         allowDangerousHtml: true,
  //       }),
  //     ),
  //   ),
  // )
  // const result = toHtml(
  //   raw(
  //     toHast(fromMarkdown(md), {
  //       allowDangerousHtml: true,
  //     }),
  //   ),
  //   {
  //     allowDangerousCharacters: true,
  //     allowDangerousHtml: true,
  //   },
  // )
  // console.log(result)
})
