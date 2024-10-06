import JSZip from 'jszip'
import { defineConfig } from 'tsup'
import manifest from './src/plugin.json'
import { mkdir, readFile, writeFile } from 'fs/promises'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  bundle: true,
  splitting: false,
  esbuildOptions: (options) => {
    options.platform = 'browser'
  },
  plugins: [
    {
      name: 'plugin-novachat',
      async buildEnd() {
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
      },
    },
  ],
})
