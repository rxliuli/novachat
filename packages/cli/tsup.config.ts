import { defineConfig } from 'tsup'

export default defineConfig({
  entryPoints: ['./src/bin.ts'],
  format: ['esm'],
})
