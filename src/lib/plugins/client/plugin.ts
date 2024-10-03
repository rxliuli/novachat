import type { Attachment, Message } from '$lib/types/Message'
import { cb2gen } from '$lib/utils/cb2gen'
import {
  defineWorkerProtocol,
  defineMessaging,
  type PluginContext,
} from '../protocol'

interface QueryRequest {
  messages: (Pick<Message, 'content' | 'from'> & {
    attachments?: Pick<Attachment, 'url'>[]
  })[]
  model: string
}
interface QueryResponse {
  content: string
}
interface QueryChunkResponse {
  content: string
  replace?: boolean
}
export interface Model {
  id: string
  name: string
}
interface Provider {
  name: string
  models: Model[]
  invoke(query: QueryRequest): Promise<QueryResponse>
  stream(query: QueryRequest): AsyncGenerator<QueryChunkResponse>
}

interface ModelApi {
  getDefault(): Promise<Model>
  invoke(query: QueryRequest): Promise<QueryResponse>
  stream(query: QueryRequest): AsyncGenerator<QueryChunkResponse>
  registerProvider(provider: Provider): Promise<void>
}

function createModelApi(): ModelApi {
  const { sendMessage } = defineWorkerProtocol()
  return {
    getDefault: () => sendMessage('execute', { id: 'model.getDefault' }),
    invoke: async (query) =>
      sendMessage('execute', {
        id: 'model.invoke',
        args: [query],
      }),
    stream: (query) =>
      cb2gen<QueryChunkResponse>((cb) =>
        sendMessage('execute', {
          id: 'model.stream',
          args: [query, cb],
        }),
      ),
    async registerProvider(provider) {
      const invokeCmd = provider.name + '.model.invoke'
      sendMessage('register', {
        id: invokeCmd,
        cb: provider.invoke,
      })
      const streamCmd = provider.name + '.model.stream'
      sendMessage('register', {
        id: streamCmd,
        cb: async (
          query: QueryRequest,
          cb: (chunk: QueryChunkResponse) => void,
        ) => {
          for await (const it of provider.stream(query)) {
            cb(it)
          }
        },
      })
      const activatedModels = provider.models.map((it) => ({
        id: it.id,
        name: it.name,
        command: {
          invoke: invokeCmd,
          stream: streamCmd,
        },
      }))
      await sendMessage('execute', {
        id: 'model.register',
        args: [activatedModels],
      })
    },
  }
}

const model = createModelApi()

export {
  model,
  defineMessaging,
  type QueryRequest,
  type QueryResponse,
  type QueryChunkResponse,
  type PluginContext,
}
