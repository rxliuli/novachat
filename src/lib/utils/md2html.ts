import { toHtml } from 'hast-util-to-html'
import { fromMarkdown } from 'mdast-util-from-markdown'
import { gfmFromMarkdown } from 'mdast-util-gfm'
import { newlineToBreak } from 'mdast-util-newline-to-break'
import { toHast, type Handler } from 'mdast-util-to-hast'
import { gfm } from 'micromark-extension-gfm'
import { type Highlighter } from 'shiki'
import type { Code } from 'mdast'
import type { Element } from 'hast'
import { SUPPORT_LANGUAGES } from './highlighter'

export function hastSvg(): Handler {
  return (_state, node, _parent) => {
    const lang = node.lang
    if (lang === 'svg' || (lang === 'xml' && node.value.startsWith('<svg'))) {
      const code = node as Code
      const value = code.value
      return {
        type: 'element',
        tagName: 'custom-svg',
        properties: {
          value: value,
        },
        children: [],
      } as Element
    }
  }
}

export function hastShiki(highlighter: Highlighter): Handler {
  return (_state, node, _parent) => {
    const code = node as Code
    let lang = code.lang ?? 'text'
    const value = code.value
    if (!SUPPORT_LANGUAGES.includes(lang)) {
      console.warn(`Unsupported language: ${lang}`)
      lang = 'text'
    }
    const hast = highlighter.codeToHast(value, {
      lang,
      themes: {
        light: 'github-light',
        dark: 'github-dark',
      },
    })
    const r = hast.children[0] as Element
    r.properties.code = code.value
    return r
  }
}

export function md2html(md: string, highlighter: Highlighter) {
  const root = fromMarkdown(md, {
    extensions: [gfm()],
    mdastExtensions: [gfmFromMarkdown(), { transforms: [newlineToBreak] }],
  })
  const hast = toHast(root, {
    handlers: {
      code: hastShiki(highlighter),
    },
  })
  return toHtml(hast)
}
