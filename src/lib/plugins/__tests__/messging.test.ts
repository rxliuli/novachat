import { last, sum } from 'lodash-es'
import { beforeEach, describe } from 'vitest'
import { expect } from 'vitest'
import { vi } from 'vitest'
import { it } from 'vitest'
import { defineMessaging, unWarpCallback, warpCallback } from '../messging'

describe('wrapCallback and unWarpCallback', () => {
  it('should work', () => {
    const map = new Map<string, Function>()
    const f = vi.fn().mockImplementation((a) => a)
    const wf = warpCallback({
      name: 'each',
      args: [[1, 2, 3], f],
    })
    wf.cbs.forEach((it) => map.set(it.key, it.cb))
    expect(wf.cbs).length(1)
    const uwf = unWarpCallback(wf.value, (name, ...args) =>
      map.get(name)?.(...args),
    )
    expect((last(uwf.args) as Function)(1)).eq(1)
    expect(f.mock.calls[0][0]).eq(1)
  })
})

describe('defineMessging', () => {
  // eslint-disable-next-line functional/no-let
  let port1: MessagePort, port2: MessagePort

  beforeEach(() => {
    const channel = new MessageChannel()
    port1 = channel.port1
    port2 = channel.port2

    port1.start()
    port2.start()
  })

  it('send and on', async () => {
    const { onMessage, sendMessage } = defineMessaging<{
      add(a: number, b: number): number
    }>()
    onMessage(port1, 'add', (a, b) => a + b)
    expect(await sendMessage(port2, 'add', 1, 2)).eq(3)
  })

  it('callback', async () => {
    const { onMessage, sendMessage } = defineMessaging<{
      each(list: number[], cb: (it: number) => void): void
    }>()
    onMessage(port1, 'each', async (list, cb) => list.forEach((v) => cb(v)))
    const f = vi.fn()
    await sendMessage(port2, 'each', [1, 2, 3], f)
    expect(f).toHaveBeenCalledTimes(3)
    expect(f.mock.calls.flat()).toEqual([1, 2, 3])
  })

  it('deep callback', async () => {
    const { onMessage, sendMessage } = defineMessaging<{
      register(handler: (cb: () => any) => any): any
      exec(): void
    }>()
    let handler: ((cb: () => any) => any) | undefined
    onMessage(port1, 'register', (_handler) => {
      handler = _handler
    })
    await sendMessage(port2, 'register', (h) => h())
    expect(handler).not.undefined
    expect(await handler!(() => 0)).eq(0)
  })
})
