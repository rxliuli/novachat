import JSZip from 'jszip'
import { mkdir, readFile, writeFile } from 'fs/promises'
import { type Plugin } from 'esbuild'
import path from 'path'

export function novachatPlugin(options: { root: string }): Plugin {
  return {
    name: 'esbuild-plugin-novachat',
    setup(build) {
      build.onEnd(async () => {
        const manifest = JSON.parse(
          await readFile(
            path.resolve(options.root, 'src/plugin.json'),
            'utf-8',
          ),
        )
        const pkg = JSON.parse(await readFile('package.json', 'utf-8'))
        manifest.version = pkg.version
        const zip = new JSZip()
        zip.file('plugin.json', JSON.stringify(manifest))
        zip.file('index.js', await readFile('dist/index.js'))
        await mkdir('publish', { recursive: true })
        await writeFile(
          'publish/plugin.zip',
          await zip.generateAsync({ type: 'nodebuffer' }),
        )
        await writeFile(
          'publish/plugin.json',
          JSON.stringify(manifest, null, 2),
        )
      })
    },
  }
}
