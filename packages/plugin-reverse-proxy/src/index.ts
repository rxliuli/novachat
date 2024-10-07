import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { HTTPException } from 'hono/http-exception'

const app = new Hono()

app
  .use(
    cors({
      origin: (origin) => {
        if (origin) {
          const u = new URL(origin)
          if (
            ['localhost', 'app.novachat.dev'].includes(u.hostname) ||
            u.hostname.endsWith('.pages.dev')
          ) {
            return origin
          }
        }
        throw new HTTPException(403, {
          message: 'Forbidden',
        })
      },
    }),
  )
  // .get('/stream', (c) => {
  //   return streamSSE(c, async (c) => {
  //     await c.writeSSE({ data: 'hello' })
  //     await c.writeSSE({ data: ' world' })
  //   })
  // })
  .all('/proxy', async (c) => {
    const url = new URL(c.req.url).searchParams.get('url')
    if (!url) {
      return c.text('url is required')
    }
    const res = await fetch(url, c.req.raw)
    return new Response(res.body, res)
  })

export default app
