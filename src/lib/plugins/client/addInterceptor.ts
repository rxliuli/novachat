import {
  type InterceptOptions,
  interceptFetch,
  interceptXHR,
} from '../interceptors'

const newLocal: InterceptOptions = {
  request(req) {
    if (['127.0.0.1', 'localhost'].includes(new URL(req.url).hostname)) {
      return req
    }
    const redirectUrl =
      import.meta.env.VITE_REVERSE_PROXY_URL + '?url=' + req.url
    return new Request(redirectUrl)
  },
}
interceptFetch(newLocal)
interceptXHR(newLocal)
