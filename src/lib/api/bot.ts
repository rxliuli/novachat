import type { Message } from '$lib/types/Message'
import { get } from 'svelte/store'
import { pluginStore } from '$lib/plugins/store'
import { cb2gen } from '$lib/utils/cb2gen'
import { sortBy } from 'lodash-es'

interface ChatCompletionChunk {
  content: string
  replace?: boolean
}

interface ChatCompletion {
  content: string
}

export type EndpointMessage = Pick<Message, 'from' | 'content' | 'attachments'>

interface BotRequest {
  messages: EndpointMessage[]
  controller: AbortController
  model: string
}

interface Bot {
  invoke(req: BotRequest): Promise<ChatCompletion>
  stream(req: BotRequest): AsyncGenerator<ChatCompletionChunk>
}

function createBot(): Bot {
  const client = (modelName: string) => {
    const model = get(pluginStore).models.find((it) => it.id === modelName)
    if (!model) {
      throw new Error(`Model ${modelName} not found`)
    }
    return model
  }
  function handleMessages(messages: EndpointMessage[]) {
    return sortBy(messages, 'createdAt').map((it) => ({
      ...it,
      role: it.from,
      attachments: it.attachments?.filter((it) => it.url),
    }))
  }
  return {
    async invoke(options: BotRequest) {
      return await pluginStore.executeCommand(
        client(options.model).command.invoke,
        {
          model: options.model,
          messages: handleMessages(options.messages),
        },
      )
    },
    stream(options): AsyncGenerator<ChatCompletionChunk> {
      return cb2gen(
        (cb) =>
          pluginStore.executeCommand(
            client(options.model).command.stream,
            {
              model: options.model,
              messages: handleMessages(options.messages),
            },
            cb,
          ),
        options.controller.signal,
      )
    },
  }
}

export const bot = createBot()
