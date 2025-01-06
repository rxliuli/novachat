import { minimatch } from 'minimatch'
import { Vista, type Middleware } from '@rxliuli/vista'

// const EXCLUDE_HOSTNAME = ['127.0.0.1', 'localhost']
const INCLUDE_HOSTNAME = ['*.googleapis.com', 'api.anthropic.com']

const proxy: () => Middleware = () => async (c, next) => {
  const hostname = new URL(c.req.url).hostname
  if (INCLUDE_HOSTNAME.some((it) => minimatch(hostname, it))) {
    const redirectUrl =
      import.meta.env.VITE_REVERSE_PROXY_URL + '?url=' + c.req.url
    c.req = new Request(redirectUrl, c.req)
  }
  await next()
}

const vista = new Vista()
vista.use(proxy())
vista.intercept()
