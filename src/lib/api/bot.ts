import { OpenAI } from 'openai'
import type { Message } from '$lib/types/Message'
import { get } from 'svelte/store'
import { settingsStore } from '$lib/stores/settings'
import { pluginStore } from '$lib/plugins/store'
import { cb2gen } from '$lib/utils/cb2gen'

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
      throw new Error('Default model not found')
    }
    return model
  }
  return {
    async invoke(options: BotRequest) {
      return await pluginStore.executeCommand(
        client(options.model).command.invoke,
        {
          model: options.model,
          messages: options.messages,
        },
      )
    },
    stream(options): AsyncGenerator<ChatCompletionChunk> {
      return cb2gen((cb) =>
        pluginStore.executeCommand(
          client(options.model).command.stream,
          {
            model: options.model,
            messages: options.messages,
          },
          cb,
        ),
      )
    },
  }
}

export const bot = createBot()
