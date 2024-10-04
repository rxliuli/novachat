import { build } from 'esbuild'
import { mkdir, rm, writeFile } from 'fs/promises'
import path from 'pathe'
import JSZip from 'jszip'
import manifest from './plugin.json'

const result = await build({
  entryPoints: [path.resolve(__dirname, 'index.ts')],
  write: false,
  format: 'esm',
  bundle: true,
  sourcemap: 'inline',
  external: ['@novachat/plugin'],
})

const zip = new JSZip()
zip.file('plugin.json', JSON.stringify(manifest, null, 2))
zip.file('index.js', result.outputFiles![0].text)

const buffer = await zip.generateAsync({ type: 'nodebuffer' })
const distPath = path.resolve(__dirname, 'dist')
await rm(distPath, { recursive: true, force: true })
await mkdir(distPath, { recursive: true })
await writeFile(path.resolve(distPath, 'plugin.zip'), buffer)
