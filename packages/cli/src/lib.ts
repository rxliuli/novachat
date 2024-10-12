import path from 'path'
import { readFile, writeFile } from 'fs/promises'

export async function updateText(options: {
  rootPath: string
  rules: {
    path: string
    replaces: [string, string][]
  }[]
}) {
  for (const rule of options.rules) {
    let content = await readFile(
      path.resolve(options.rootPath, rule.path),
      'utf-8',
    )
    for (const [from, to] of rule.replaces) {
      content = content.replace(from, to)
    }
    await writeFile(path.resolve(options.rootPath, rule.path), content)
  }
}
