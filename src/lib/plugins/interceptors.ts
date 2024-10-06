export function normalizeUrl(url: string | URL | Request) {
  if (typeof url === 'string') {
    return url
  }
  if (url instanceof URL) {
    return url.href
  }
  return url.url
}

export interface InterceptOptions {
  request: (req: Request) => Request
}

export function interceptXHR(options: InterceptOptions) {
  const pureOpen = XMLHttpRequest.prototype.open
  XMLHttpRequest.prototype.open = function (
    method: string,
    url: string | URL,
    ...args: any[]
  ) {
    const req = options.request(new Request(url, { method }))
    return pureOpen.apply(this, [req.method, req.url, ...args] as any)
  }
  return () => {
    XMLHttpRequest.prototype.open = pureOpen
  }
}

export function interceptFetch(options: InterceptOptions) {
  const pureFetch = globalThis.fetch
  globalThis.fetch = (input, init) => {
    const req = new Request(input, init)
    return pureFetch(options.request(req), init)
  }
  return () => {
    globalThis.fetch = pureFetch
  }
}
