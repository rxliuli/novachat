import { afterEach, describe, expect, it, vi } from 'vitest'
import { interceptFetch, interceptXHR } from '../interceptors'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('interceptFetch', () => {
  it('should intercept fetch', async () => {
    const spy = vi
      .spyOn(globalThis, 'fetch')
      .mockImplementation(async () => new Response())
    const logger = vi.fn()
    const unIntercept = interceptFetch({
      request: (req) => {
        logger(req.url)
        return req
      },
    })
    await fetch('https://example.com/')
    expect(logger.mock.calls[0][0]).eq('https://example.com/')
    await fetch(new URL('https://example.com/'))
    expect(logger.mock.calls[1][0]).toBe('https://example.com/')
    await fetch(new Request('https://example.com/'))
    expect(logger.mock.calls[2][0]).toBe('https://example.com/')
    expect(spy).toBeCalledTimes(3)
    unIntercept()
  })
  it('should intercept fetch and modify url', async () => {
    const spy = vi
      .spyOn(globalThis, 'fetch')
      .mockImplementation(async () => new Response())
    const unIntercept = interceptFetch({
      request: (req) => {
        return new Request('https://example.org/test', req)
      },
    })
    await fetch('https://example.com')
    expect((spy.mock.calls[0][0] as Request).url).toBe(
      'https://example.org/test',
    )
    unIntercept()
  })
})

describe('interceptXHR', () => {
  it('should intercept XHR', async () => {
    const logger = vi.fn()
    const unIntercept = interceptXHR({
      request: (req) => {
        logger(req.url)
        return req
      },
    })
    const xhr = new XMLHttpRequest()
    xhr.open('GET', 'https://example.com/')
    xhr.send()
    expect(logger.mock.calls[0][0]).toBe('https://example.com/')
    unIntercept()
  })
  it('should intercept XHR and modify url', () => {
    const unIntercept = interceptXHR({
      request: (req) => {
        return new Request('https://example.org/test', req)
      },
    })
    const xhr = new XMLHttpRequest()
    xhr.open('GET', 'https://example.com/')
    xhr.send()
    unIntercept()
  })
})
