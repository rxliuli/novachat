import { safeDeepTraverse } from '$lib/utils/safeDeepTraverse'
import { listen, put } from '@fcanvas/communicate'
import { nanoid } from 'nanoid'

type FnAny = (...args: any[]) => any

export interface LikeMessagePort {
  addEventListener(
    name: 'message',
    cb: (event: MessageEvent<any>) => void,
    options?: unknown,
  ): void
  removeEventListener(
    name: 'message',
    cb: (event: MessageEvent<any>) => void,
    options?: unknown,
  ): void
  postMessage(message: any, options?: unknown): void
}

export function warpCallback<T extends object>(obj: T) {
  const cbs: {
    cb: FnAny
    key: string
  }[] = []
  return {
    value: safeDeepTraverse(obj, (it) => {
      if (typeof it === 'function') {
        const key = nanoid()
        cbs.push({ cb: it, key })
        return {
          __CALLBACK__: key,
        }
      }
      return it
    }),
    cbs,
  }
}

export function unWarpCallback<T extends object>(
  obj: T,
  sendMessage: (name: string, ...args: any[]) => Promise<any>,
) {
  return safeDeepTraverse(obj, (it) => {
    if (
      typeof it === 'object' &&
      '__CALLBACK__' in it &&
      typeof it.__CALLBACK__ === 'string'
    ) {
      return (...args: any[]) => sendMessage(it.__CALLBACK__ as string, ...args)
    }
    return it
  })
}

interface Messging<T extends Record<string, (...args: any[]) => any>> {
  onMessage<K extends keyof T & string>(
    port: LikeMessagePort,
    name: K,
    cb: T[K],
  ): void
  sendMessage<K extends keyof T & string>(
    port: LikeMessagePort,
    name:
      | K
      | {
          name: K
          timeout?: number
          signal?: AbortSignal
        },
    ...args: Parameters<T[K]>
  ): Promise<Awaited<ReturnType<T[K]>>>
}

export function defineMessaging<
  T extends Record<string, (...args: any[]) => any>,
>(): Messging<T> {
  const sendMessage: Messging<T>['sendMessage'] = (port, name, ...args) => {
    const wf = warpCallback(args)
    wf.cbs.forEach((it) => onMessage(port, it.key, it.cb as any))
    return put(port, name as any, ...wf.value)
  }
  const onMessage: Messging<T>['onMessage'] = (port, name, cb) => {
    listen(port, name as any, (...args) => {
      const uwf = unWarpCallback(args, (cbName, ...args) =>
        sendMessage(
          port,
          // TODO: This llm stream need long timeout
          { name: cbName, timeout: 1000 * 60 * 10 },
          ...(args as any),
        ),
      )
      return cb(...uwf)
    })
  }
  return {
    onMessage,
    sendMessage,
  }
}
