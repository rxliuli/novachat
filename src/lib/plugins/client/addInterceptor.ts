import {
  type InterceptOptions,
  interceptFetch,
  interceptXHR,
} from '../interceptors'
import { minimatch } from 'minimatch'

// const EXCLUDE_HOSTNAME = ['127.0.0.1', 'localhost']
const INCLUDE_HOSTNAME = ['*.googleapis.com', 'api.anthropic.com']

const newLocal: InterceptOptions = {
  request(req) {
    const hostname = new URL(req.url).hostname
    if (INCLUDE_HOSTNAME.some((it) => minimatch(hostname, it))) {
      const redirectUrl =
        import.meta.env.VITE_REVERSE_PROXY_URL + '?url=' + req.url
      return new Request(redirectUrl)
    }
    return req
  },
}
interceptFetch(newLocal)
interceptXHR(newLocal)
