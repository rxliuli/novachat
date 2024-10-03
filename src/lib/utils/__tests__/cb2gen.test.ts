import { it, expect } from 'vitest'
import { cb2gen } from '../cb2gen'

it('cb2gen', async () => {
  async function f1(list: number[], cb: (chunk: number) => void) {
    for (const item of list) {
      cb(item)
      await new Promise((resolve) => setTimeout(resolve, 100))
    }
  }
  const f2 = (list: number[]) => cb2gen<number>((cb) => f1(list, cb))
  const r: number[] = []
  for await (const it of f2([1, 2, 3])) {
    r.push(it)
  }
  expect(r).toEqual([1, 2, 3])
})
