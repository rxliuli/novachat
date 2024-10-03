import { describe, expect, it, vi } from 'vitest'
import { safeDeepTraverse } from '../safeDeepTraverse'
import { sum } from 'lodash-es'

describe('safeDeepTraverse', () => {
  it('should work', () => {
    const map = new Map<Symbol, Function>()
    const r = safeDeepTraverse(
      {
        list: [1, 2, 3, 4],
        sum,
      },
      (it) => {
        if (typeof it === 'function') {
          const id = Symbol('fn')
          map.set(id, it)
          return {
            __CALLBACK__: id,
          }
        }
        return it
      },
    )
    expect(r.sum).toEqual({ __CALLBACK__: [...map.keys()][0] })
  })
  it('match shape', () => {
    const f = vi.fn().mockImplementation((a) => a)
    safeDeepTraverse(
      {
        list: [1, 2, 3, 4],
        sum: {
          __CALLBACK__: Symbol('fn'),
        },
      },
      f,
    )
    // console.log(f.mock.calls)
    expect(
      f.mock.calls.some(
        ([it]) => typeof it === 'object' && '__CALLBACK__' in it,
      ),
    ).true
  })
  it('include map/date', () => {
    const map = new Map<Symbol, Function>()
    const f = vi.fn().mockImplementation((a) => a)
    safeDeepTraverse(
      {
        map: new Map([[Symbol('a'), 1]]),
        date: new Date(),
      },
      f,
    )
    expect(f.mock.calls).length(3)
  })
})
