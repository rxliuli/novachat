import { codeToHtml } from 'shiki'

export async function highlight(code: string, lang: string) {
  return await codeToHtml(code, {
    lang: lang,
    themes: {
      light: 'github-light',
      dark: 'github-dark',
    },
    structure: 'classic',
  })
}
