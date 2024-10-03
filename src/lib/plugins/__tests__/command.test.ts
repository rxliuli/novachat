import { expect, it } from 'vitest'
import { buildCode } from '../builder'
import helloWorldRaw from './mock/hello-world.ts?raw'

it('buildCode', async () => {
  const code = await buildCode(helloWorldRaw)
  expect(code).not.undefined
})
