import { createHighlighter } from 'shiki'
import { once } from 'lodash-es'
import type { Highlighter } from 'shiki'

let _highlighter: Highlighter
async function _getHighlighter() {
  if (!_highlighter) {
    _highlighter = await createHighlighter({
      themes: ['github-light', 'github-dark'],
      langs: [
        'typescript',
        'javascript',
        'jsx',
        'tsx',
        'json',
        'svelte',
        'xml',
        'html',
        'yaml',
        'yml',
        'json5',
        'rust',
        'java',
        'kotlin',
      ],
    })
  }
  return _highlighter
}

const getHighlighter = once(_getHighlighter)
export const highlighter = await getHighlighter()
