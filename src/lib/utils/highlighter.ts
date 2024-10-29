import { createHighlighter } from 'shiki'
import { once } from 'lodash-es'
import type {
  Highlighter,
  LanguageInput,
  SpecialLanguage,
  StringLiteralUnion,
} from 'shiki'

export const SUPPORT_LANGUAGES: (
  | LanguageInput
  | StringLiteralUnion<string>
  | SpecialLanguage
)[] = [
  'typescript',
  'javascript',
  'jsx',
  'tsx',
  'html',
  'css',
  'scss',
  'less',
  'json5',
  'vue',
  'json',
  'svelte',
  'xml',
  'yaml',
  'yml',
  'rust',
  'java',
  'kotlin',
]

async function _getHighlighter() {
  return await createHighlighter({
    themes: ['github-light', 'github-dark'],
    langs: SUPPORT_LANGUAGES,
  })
}

export const highlighter = await _getHighlighter()
