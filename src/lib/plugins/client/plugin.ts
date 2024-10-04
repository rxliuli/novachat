import type { Attachment, Message } from '$lib/types/Message'
import { cb2gen } from '$lib/utils/cb2gen'
import {
  defineWorkerProtocol,
  pluginContext,
  type PluginContext,
} from './protocol'
import type { ActivatedModel } from '../store'

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

type Bot = Model & Pick<Provider, 'stream'>

interface ModelApi {
  getDefault(): Promise<Model | undefined>
  invoke(query: QueryRequest): Promise<QueryResponse>
  stream(query: QueryRequest): AsyncGenerator<QueryChunkResponse>
  registerProvider(provider: Provider): Promise<void>
  registerBot(bot: Bot): Promise<void>
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
      const activatedModels = provider.models.map(
        (it) =>
          ({
            id: it.id,
            name: it.name,
            command: {
              invoke: invokeCmd,
              stream: streamCmd,
            },
            pluginId: pluginContext!.pluginId,
            type: 'llm',
          } satisfies ActivatedModel),
      )
      await sendMessage('execute', {
        id: 'model.register',
        args: [activatedModels],
      })
    },
    registerBot: async (bot) => {
      const streamCmd = bot.id + '.model.invoke'
      await sendMessage('register', {
        id: streamCmd,
        cb: async (
          query: QueryRequest,
          cb: (chunk: QueryChunkResponse) => void,
        ) => {
          for await (const it of bot.stream(query)) {
            cb(it)
          }
        },
      })
      await sendMessage('execute', {
        id: 'model.register',
        args: [
          [
            {
              id: bot.id,
              name: bot.name,
              command: {
                invoke: '',
                stream: streamCmd,
              },
              pluginId: pluginContext!.pluginId,
              type: 'bot',
            } satisfies ActivatedModel,
          ],
        ],
      })
    },
  }
}

interface SettingApi {
  get(key: string): Promise<any>
  set(key: string, value: any): Promise<void>
}

function createSettingApi(): SettingApi {
  const { sendMessage } = defineWorkerProtocol()
  return {
    get: (key: string) =>
      sendMessage('execute', { id: 'setting.get', args: [key] }),
    set: (key: string, value: any) =>
      sendMessage('execute', { id: 'setting.set', args: [key, value] }),
  }
}

const model = createModelApi()
const setting = createSettingApi()

export {
  model,
  setting,
  type QueryRequest,
  type QueryResponse,
  type QueryChunkResponse,
  type PluginContext,
}
